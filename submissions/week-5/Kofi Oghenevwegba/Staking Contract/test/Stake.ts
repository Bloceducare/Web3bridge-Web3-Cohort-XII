import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("CoolStake", function () {
  let mockToken: Contract;
  let coolStake: Contract;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  const INITIAL_SUPPLY = ethers.parseEther("1000000");
  const STAKE_AMOUNT = ethers.parseEther("1000");
  const REWARD_RATE = ethers.parseUnits("1", "wei");
  const MIN_STAKING_TIME = 60; // 60 seconds

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy Mock Token
    const MockToken = await ethers.getContractFactory("MockERC20");
    mockToken = await MockToken.deploy("Mock Token", "MTK");
    await mockToken.waitForDeployment();

    // Deploy CoolStake
    const CoolStake = await ethers.getContractFactory("CoolStake");
    coolStake = await CoolStake.deploy(
      await mockToken.getAddress(),
      REWARD_RATE,
      MIN_STAKING_TIME
    );
    await coolStake.waitForDeployment();

    // Mint tokens to users
    await mockToken.mint(user1.address, INITIAL_SUPPLY);
    await mockToken.mint(user2.address, INITIAL_SUPPLY);

    // Approve CoolStake contract
    await mockToken.connect(user1).approve(await coolStake.getAddress(), INITIAL_SUPPLY);
    await mockToken.connect(user2).approve(await coolStake.getAddress(), INITIAL_SUPPLY);
  });

  describe("Deployment", function () {
    it("Should set the correct staking token", async function () {
      expect(await coolStake.stakingToken()).to.equal(await mockToken.getAddress());
    });

    it("Should set the correct reward rate", async function () {
      expect(await coolStake.rewardRate()).to.equal(REWARD_RATE);
    });

    it("Should set the correct minimum staking time", async function () {
      expect(await coolStake.minStakingTime()).to.equal(MIN_STAKING_TIME);
    });
  });

  describe("Staking", function () {
    it("Should allow users to stake tokens", async function () {
      await coolStake.connect(user1).deposit(STAKE_AMOUNT);
      const stake = await coolStake.stakes(user1.address);
      expect(stake.amount).to.equal(STAKE_AMOUNT);
    });

    it("Should emit Deposited event", async function () {
      await expect(coolStake.connect(user1).deposit(STAKE_AMOUNT))
        .to.emit(coolStake, "Deposited")
        .withArgs(user1.address, STAKE_AMOUNT);
    });

    it("Should not allow zero stake amount", async function () {
      await expect(coolStake.connect(user1).deposit(0))
        .to.be.revertedWith("Cannot stake 0");
    });
  });

  describe("Rewards", function () {
    it("Should calculate pending rewards correctly", async function () {
      await coolStake.connect(user1).deposit(STAKE_AMOUNT);
      
      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [3600]); // 1 hour
      await ethers.provider.send("evm_mine", []);

      const expectedReward = STAKE_AMOUNT * BigInt(3600) * REWARD_RATE;
      const pendingReward = await coolStake.pendingReward(user1.address);
      expect(pendingReward).to.be.closeTo(expectedReward, ethers.parseUnits("1", "wei"));
    });
  });

  describe("Withdrawals", function () {
    it("Should not allow withdrawal before minimum staking time", async function () {
      await coolStake.connect(user1).deposit(STAKE_AMOUNT);
      await expect(coolStake.connect(user1).withdraw(STAKE_AMOUNT))
        .to.be.revertedWith("Minimum staking period not met");
    });

    it("Should allow withdrawal after minimum staking time", async function () {
      await coolStake.connect(user1).deposit(STAKE_AMOUNT);
      
      // Fast forward time past minimum staking time
      await ethers.provider.send("evm_increaseTime", [MIN_STAKING_TIME + 1]);
      await ethers.provider.send("evm_mine", []);

      await coolStake.connect(user1).withdraw(STAKE_AMOUNT);
      const stake = await coolStake.stakes(user1.address);
      expect(stake.amount).to.equal(0);
    });

    it("Should emit Withdrawn event with correct reward", async function () {
      await coolStake.connect(user1).deposit(STAKE_AMOUNT);
      
      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [MIN_STAKING_TIME + 3600]); // 1 hour after min time
      await ethers.provider.send("evm_mine", []);

      const expectedReward = STAKE_AMOUNT * BigInt(3600 + MIN_STAKING_TIME) * REWARD_RATE;
      
      await expect(coolStake.connect(user1).withdraw(STAKE_AMOUNT))
        .to.emit(coolStake, "Withdrawn")
        .withArgs(user1.address, STAKE_AMOUNT, expectedReward);
    });
  });
});