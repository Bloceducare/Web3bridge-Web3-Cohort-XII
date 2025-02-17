import { expect } from "chai";
import { ethers } from "hardhat";
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("Staking Contract", function () {
    async function deployStakingFixture() {
        const [owner, user1, user2] = await ethers.getSigners();

        const LagCoin = await ethers.getContractFactory("LagCoin");

        const lagCoin = await LagCoin.deploy(owner.address); 
        await lagCoin.waitForDeployment();

        const Staking = await ethers.getContractFactory("Staking");
        const staking = await Staking.deploy(await lagCoin.getAddress());
        await staking.waitForDeployment();

        const mintAmount = ethers.parseEther("1000");
        await lagCoin.mint(user1.address, mintAmount);

        return { staking, lagCoin, owner, user1, user2, mintAmount };
    }

    describe("Deployment", function () {
        it("Should set the correct token address", async function () {
            const { staking, lagCoin } = await loadFixture(deployStakingFixture);
            expect(await staking.token()).to.equal(await lagCoin.getAddress());
        });

        it("Should set the correct constants", async function () {
            const { staking } = await loadFixture(deployStakingFixture);
            expect(await staking.REWARD_RATE()).to.equal(100);
            expect(await staking.MIN_LOCK()).to.equal(7 * 24 * 60 * 60); // 7 days in seconds
        });
    });

    describe("Staking", function () {
        it("Should fail if lock time is too short", async function () {
            const { staking, lagCoin, user1 } = await loadFixture(deployStakingFixture);
            const stakeAmount = ethers.parseEther("100");
            const shortLockTime = 6 * 24 * 60 * 60; // 6 days

            await lagCoin.connect(user1).approve(staking.getAddress(), stakeAmount);
            await expect(staking.connect(user1).stake(stakeAmount, shortLockTime))
                .to.be.revertedWithCustomError(staking, "LockTooShort");
        });

        it("Should successfully stake tokens", async function () {
            const { staking, lagCoin, user1 } = await loadFixture(deployStakingFixture);
            const stakeAmount = ethers.parseEther("100");
            const lockTime = 7 * 24 * 60 * 60; // 7 days

            await lagCoin.connect(user1).approve(staking.getAddress(), stakeAmount);
            await staking.connect(user1).stake(stakeAmount, lockTime);

            const stake = await staking.stakes(user1.address);
            expect(stake.amount).to.equal(stakeAmount);
            expect(stake.lockTime).to.equal(lockTime);
        });

        it("Should transfer tokens to the contract", async function () {
            const { staking, lagCoin, user1 } = await loadFixture(deployStakingFixture);
            const stakeAmount = ethers.parseEther("100");
            const lockTime = 7 * 24 * 60 * 60;

            await lagCoin.connect(user1).approve(staking.getAddress(), stakeAmount);
            await staking.connect(user1).stake(stakeAmount, lockTime);

            expect(await lagCoin.balanceOf(staking.getAddress())).to.equal(stakeAmount);
        });
    });

    describe("Withdrawal", function () {
        it("Should fail if user has no stake", async function () {
            const { staking, user1 } = await loadFixture(deployStakingFixture);
            await expect(staking.connect(user1).withdraw())
                .to.be.revertedWithCustomError(staking, "NoStake");
        });

        it("Should fail if stake is still locked", async function () {
            const { staking, lagCoin, user1 } = await loadFixture(deployStakingFixture);
            const stakeAmount = ethers.parseEther("100");
            const lockTime = 7 * 24 * 60 * 60;

            await lagCoin.connect(user1).approve(staking.getAddress(), stakeAmount);
            await staking.connect(user1).stake(stakeAmount, lockTime);

            await expect(staking.connect(user1).withdraw())
                .to.be.revertedWithCustomError(staking, "StillLocked");
        });

        it("Should successfully withdraw with rewards after lock period", async function () {
            const { staking, lagCoin, user1 } = await loadFixture(deployStakingFixture);
            const stakeAmount = ethers.parseEther("100");
            const lockTime = 7 * 24 * 60 * 60;

            await lagCoin.connect(user1).approve(staking.getAddress(), stakeAmount);
            await staking.connect(user1).stake(stakeAmount, lockTime);

            await ethers.provider.send("evm_increaseTime", [lockTime]);
            await ethers.provider.send("evm_mine");

            const balanceBefore = await lagCoin.balanceOf(user1.address);
            await staking.connect(user1).withdraw();
            const balanceAfter = await lagCoin.balanceOf(user1.address);

            expect(balanceAfter).to.be.gt(balanceBefore.add(stakeAmount));
        });

        it("Should calculate rewards correctly", async function () {
            const { staking, lagCoin, user1 } = await loadFixture(deployStakingFixture);
            const stakeAmount = ethers.parseEther("100");
            const lockTime = 7 * 24 * 60 * 60;
            const timeElapsed = 10 * 24 * 60 * 60;

            await lagCoin.connect(user1).approve(staking.getAddress(), stakeAmount);
            await staking.connect(user1).stake(stakeAmount, lockTime);

            await ethers.provider.send("evm_increaseTime", [timeElapsed]);
            await ethers.provider.send("evm_mine");

            const balanceBefore = await lagCoin.balanceOf(user1.address);
            await staking.connect(user1).withdraw();
            const balanceAfter = await lagCoin.balanceOf(user1.address);

            const expectedReward = stakeAmount * BigInt(100) * BigInt(timeElapsed) / (BigInt(100) * BigInt(24 * 60 * 60));
            expect(balanceAfter - balanceBefore).to.equal(stakeAmount + expectedReward);
        });
    });
});
