const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("StakingSystem", function () {
  let stakingSystem;
  let stakingToken;
  let owner;
  let user1;
  let user2;

  const TOKEN_DECIMALS = 18;
  const REWARD_RATE = 10; // 10% annual reward rate
  const MIN_STAKING_DURATION = 30 * 24 * 60 * 60; // 30 days in seconds

  beforeEach(async function () {
    // Get signers
    [owner, user1, user2] = await ethers.getSigners();
  
    // Deploy the ERC20Mock contract
    const Token = await ethers.getContractFactory("ERC20Mock");
    stakingToken = await Token.deploy("Staking Token", "STK", TOKEN_DECIMALS);
    console.log("ERC20Mock deployed at:", stakingToken.address);
  
    // Deploy the StakingSystem contract
    const StakingSystem = await ethers.getContractFactory("StakingSystem");
    stakingSystem = await StakingSystem.deploy(stakingToken.address);
    console.log("StakingSystem deployed at:", stakingSystem.address);
  
    // Mint tokens to users for testing
    const mintAmount = ethers.utils.parseUnits("1000", TOKEN_DECIMALS);
    await stakingToken.mint(user1.address, mintAmount);
    await stakingToken.mint(user2.address, mintAmount);
  
    // Approve the staking contract to spend tokens on behalf of users
    await stakingToken.connect(user1).approve(stakingSystem.address, mintAmount);
    await stakingToken.connect(user2).approve(stakingSystem.address, mintAmount);
  });
  describe("Staking", function () {
    it("Should allow users to stake tokens", async function () {
      const stakeAmount = ethers.utils.parseUnits("100", TOKEN_DECIMALS);

      // User1 stakes tokens
      await stakingSystem.connect(user1).stake(stakeAmount);

      // Check user1's staked amount
      const [stakedAmount, stakingStartTime] = await stakingSystem.getStakeInfo(user1.address);
      expect(stakedAmount).to.equal(stakeAmount);
      expect(stakingStartTime).to.be.gt(0);
    });

    it("Should revert if staking amount is zero", async function () {
      await expect(stakingSystem.connect(user1).stake(0)).to.be.revertedWith("Amount must be greater than 0");
    });
  });

  describe("Reward Calculation", function () {
    it("Should calculate rewards correctly", async function () {
      const stakeAmount = ethers.utils.parseUnits("100", TOKEN_DECIMALS);

      // User1 stakes tokens
      await stakingSystem.connect(user1).stake(stakeAmount);

      // Fast-forward time by 60 days
      await ethers.provider.send("evm_increaseTime", [60 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);

      // Calculate reward
      const reward = await stakingSystem.calculateReward(user1.address);

      // Expected reward = (100 * 10% * 60 days) / (365 days * 100) = ~1.6438 tokens
      const expectedReward = stakeAmount.mul(REWARD_RATE).mul(60 * 24 * 60 * 60).div(365 * 24 * 60 * 60 * 100);
      expect(reward).to.be.closeTo(expectedReward, ethers.utils.parseUnits("0.0001", TOKEN_DECIMALS));
    });

    it("Should return zero reward if no stake exists", async function () {
      const reward = await stakingSystem.calculateReward(user1.address);
      expect(reward).to.equal(0);
    });
  });

  describe("Withdrawal", function () {
    it("Should allow users to withdraw staked tokens and rewards", async function () {
      const stakeAmount = ethers.utils.parseUnits("100", TOKEN_DECIMALS);

      // User1 stakes tokens
      await stakingSystem.connect(user1).stake(stakeAmount);

      // Fast-forward time by 60 days
      await ethers.provider.send("evm_increaseTime", [60 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);

      // User1 withdraws stake and rewards
      await stakingSystem.connect(user1).withdraw();

      // Check user1's balance after withdrawal
      const user1Balance = await stakingToken.balanceOf(user1.address);
      expect(user1Balance).to.be.closeTo(
        stakeAmount.mul(2), // Initial balance was 1000, staked 100, received ~1.6438 as reward
        ethers.utils.parseUnits("0.0001", TOKEN_DECIMALS)
      );

      // Check that user1's stake is reset
      const [stakedAmount, stakingStartTime] = await stakingSystem.getStakeInfo(user1.address);
      expect(stakedAmount).to.equal(0);
      expect(stakingStartTime).to.equal(0);
    });

    it("Should revert if staking duration is less than minimum", async function () {
      const stakeAmount = ethers.utils.parseUnits("100", TOKEN_DECIMALS);

      // User1 stakes tokens
      await stakingSystem.connect(user1).stake(stakeAmount);

      // Attempt to withdraw before minimum staking duration
      await expect(stakingSystem.connect(user1).withdraw()).to.be.revertedWith("Staking duration not met");
    });
  });
});