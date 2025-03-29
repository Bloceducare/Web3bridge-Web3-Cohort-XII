const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("StakingSystem", function () {
  let owner, user1, user2;
  let StakingSystem, stakingSystem, Token, token;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy mock ERC20 token
    Token = await ethers.getContractFactory("ERC20Mock");
    token = await Token.deploy("StakeToken", "STK", owner.address, ethers.utils.parseEther("1000000"));
    await token.deployed();

    // Deploy StakingSystem contract
    StakingSystem = await ethers.getContractFactory("StakingSystem");
    stakingSystem = await StakingSystem.deploy(token.address);
    await stakingSystem.deployed();

    // Allocate tokens to users
    await token.transfer(user1.address, ethers.utils.parseEther("1000"));
    await token.transfer(user2.address, ethers.utils.parseEther("1000"));

    // Approve staking contract to spend tokens
    await token.connect(user1).approve(stakingSystem.address, ethers.utils.parseEther("1000"));
    await token.connect(user2).approve(stakingSystem.address, ethers.utils.parseEther("1000"));
  });

  it("Should allow users to stake tokens", async function () {
    await expect(stakingSystem.connect(user1).stake(ethers.utils.parseEther("100")))
      .to.emit(stakingSystem, "Staked")
      .withArgs(user1.address, ethers.utils.parseEther("100"));

    const stakeInfo = await stakingSystem.stakers(user1.address);
    expect(stakeInfo.amount).to.equal(ethers.utils.parseEther("100"));
  });

  it("Should correctly calculate rewards over time", async function () {
    await stakingSystem.connect(user1).stake(ethers.utils.parseEther("100"));

    // Simulate time passing
    await ethers.provider.send("evm_increaseTime", [86400 * 7]); // Fast-forward 7 days
    await ethers.provider.send("evm_mine"); // Mine a new block

    const rewards = await stakingSystem.calculateRewards(user1.address);
    expect(rewards).to.be.gt(0); // Rewards should be greater than 0
  });

  it("Should not allow withdrawals before the minimum staking period", async function () {
    await stakingSystem.connect(user1).stake(ethers.utils.parseEther("100"));

    await expect(stakingSystem.connect(user1).withdraw()).to.be.revertedWith(
      "Minimum staking period not reached"
    );
  });

  it("Should allow users to withdraw their stake and rewards after the staking period", async function () {
    await stakingSystem.connect(user1).stake(ethers.utils.parseEther("100"));

    // Simulate time passing
    await ethers.provider.send("evm_increaseTime", [86400 * 7]); // Fast-forward 7 days
    await ethers.provider.send("evm_mine"); // Mine a new block

    await expect(stakingSystem.connect(user1).withdraw()).to.emit(stakingSystem, "Withdrawn");

    const stakeInfo = await stakingSystem.stakers(user1.address);
    expect(stakeInfo.amount).to.equal(0); // User should have withdrawn all tokens
  });

  it("Should allow owner to update reward rate", async function () {
    await expect(stakingSystem.connect(owner).updateRewardRate(ethers.utils.parseEther("0.02")))
      .to.not.be.reverted;

    const newRate = await stakingSystem.rewardRatePerSecond();
    expect(newRate).to.equal(ethers.utils.parseEther("0.02"));
  });

  it("Should prevent non-owner from updating reward rate", async function () {
    await expect(stakingSystem.connect(user1).updateRewardRate(ethers.utils.parseEther("0.02")))
      .to.be.revertedWith("Ownable: caller is not the owner");
  });
});
