import { expect } from "chai";
import { ethers, network } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { MockERC20, Staking } from "../typechain-types";

describe("Staking", function () {
  let mockERC20: MockERC20;
  let staking: Staking;
  let owner: SignerWithAddress;
  let user: SignerWithAddress;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    const MockERC20 = await ethers.getContractFactory("MockERC20");
    mockERC20 = (await MockERC20.deploy()) as MockERC20;
    await mockERC20.waitForDeployment();

    const Staking = await ethers.getContractFactory("Staking");
    staking = (await Staking.deploy(await mockERC20.getAddress())) as Staking;
    await staking.waitForDeployment();

    await mockERC20.mint(user.address, ethers.parseEther("1000"));
    await mockERC20.connect(user).approve(await staking.getAddress(), ethers.parseEther("1000"));
  });

  it("Should stake tokens", async function () {
    const stakeAmount = ethers.parseEther("100");
    await staking.connect(user).stake(stakeAmount);
    const stakeInfo = await staking.stakes(user.address);
    expect(stakeInfo.amount).to.equal(stakeAmount);
  });

  it("Should fail to stake zero amount", async function () {
    await expect(staking.connect(user).stake(0)).to.be.revertedWithCustomError(staking, "Staking__ZeroAmount");
  });

  it("Should calculate rewards after staking period", async function () {
    const stakeAmount = ethers.parseEther("100");
    await staking.connect(user).stake(stakeAmount);
    await network.provider.send("evm_increaseTime", [86400]); // 1 day
    await network.provider.send("evm_mine");
    await staking.connect(user).claimRewards();
    const reward = await staking.rewards(user.address);
    expect(reward).to.be.gt(0);
  });

  it("Should fail to unstake before minimum period", async function () {
    const stakeAmount = ethers.parseEther("100");
    await staking.connect(user).stake(stakeAmount);
    await expect(staking.connect(user).unstake()).to.be.revertedWithCustomError(staking, "Staking__MinimumStakePeriodNotMet");
  });

  it("Should unstake after minimum period", async function () {
    const stakeAmount = ethers.parseEther("100");
    await staking.connect(user).stake(stakeAmount);
    await network.provider.send("evm_increaseTime", [86400]); // 1 day
    await network.provider.send("evm_mine");
    await staking.connect(user).unstake();
    const stakeInfo = await staking.stakes(user.address);
    expect(stakeInfo.amount).to.equal(0);
  });
});