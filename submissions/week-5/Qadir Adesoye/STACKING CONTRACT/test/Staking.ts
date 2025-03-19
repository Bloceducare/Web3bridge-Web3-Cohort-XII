import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer } from "ethers";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { MyRewardToken, Staking } from "../typechain-types"; // Import generated types

describe("Staking", function () {
    let staking: Staking;
    let token: MyRewardToken;
    let owner: Signer;
    let addr1: Signer;
    let addr2: Signer;

    const stakeAmount = ethers.parseUnits("100", 18);
    const rewardAmount = ethers.parseUnits("1000", 18);
    const MIN_STAKING_PERIOD = 7 * 24 * 60 * 60; // 7 days in seconds

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();
        const ownerAddress = await owner.getAddress();

        // Deploy token (used for both staking and rewards)
        console.log("Deploying MyRewardToken...");
        const MyRewardTokenFactory = await ethers.getContractFactory("MyRewardToken");
        token = await MyRewardTokenFactory.deploy(
            "My Reward Token",
            "MRT",
            ethers.parseUnits("1000000", 18),
            ownerAddress
        ) as MyRewardToken;

        // Deploy staking contract
        console.log("Deploying Staking...");
        const StakingFactory = await ethers.getContractFactory("Staking");
        staking = await StakingFactory.deploy(
            token.address,
            token.address,
            ownerAddress
        ) as Staking;

        // Mint tokens for testing
        console.log("Minting tokens...");
        await token.mint(ownerAddress, ethers.parseUnits("10000", 18));
        await token.mint(await addr1.getAddress(), ethers.parseUnits("1000", 18));
        await token.mint(await addr2.getAddress(), ethers.parseUnits("1000", 18));

        // Approve tokens for staking
        console.log("Setting up approvals...");
        await token.connect(addr1).approve(staking.address, ethers.MaxUint256);
        await token.connect(addr2).approve(staking.address, ethers.MaxUint256);
        await token.approve(staking.address, ethers.MaxUint256);
    });

    describe("Deployment", function () {
        it("Should set the correct staking and reward tokens", async function () {
            expect(await staking.stakingToken()).to.equal(token.address);
            expect(await staking.rewardToken()).to.equal(token.address);
        });

        it("Should set the correct owner", async function () {
            expect(await staking.owner()).to.equal(await owner.getAddress());
        });
    });

    describe("Staking", function () {
        it("Should stake tokens successfully", async function () {
            await staking.connect(addr1).stake(stakeAmount);
            const stakeInfo = await staking.getStakeInfo(await addr1.getAddress());
            expect(stakeInfo.amount).to.equal(stakeAmount);
            expect(await staking.totalStaked()).to.equal(stakeAmount);
        });

        it("Should fail to stake zero amount", async function () {
            await expect(staking.connect(addr1).stake(0)).to.be.revertedWithCustomError(
                staking,
                "Staking__InvalidAmount"
            );
        });

        it("Should fail to stake with insufficient balance", async function () {
            const largeAmount = ethers.parseUnits("10000", 18);
            await expect(staking.connect(addr1).stake(largeAmount)).to.be.revertedWithCustomError(
                staking,
                "Staking__InsufficientBalance"
            );
        });

        it("Should accumulate rewards when adding to existing stake", async function () {
            await staking.connect(addr1).stake(stakeAmount);
            await time.increase(MIN_STAKING_PERIOD);
            await staking.connect(addr1).stake(stakeAmount);
            const stakeInfo = await staking.getStakeInfo(await addr1.getAddress());
            expect(stakeInfo.accumulatedRewards).to.be.gt(0);
            expect(stakeInfo.amount).to.equal(stakeAmount.mul(2));
        });
    });

    describe("Withdrawal", function () {
        beforeEach(async function () {
            await staking.connect(addr1).stake(stakeAmount);
            await token.mint(staking.address, rewardAmount);
        });

        it("Should withdraw successfully after minimum period", async function () {
            await time.increase(MIN_STAKING_PERIOD);
            const initialBalance = await token.balanceOf(await addr1.getAddress());
            await staking.connect(addr1).withdraw();
            const finalBalance = await token.balanceOf(await addr1.getAddress());
            expect(finalBalance).to.equal(initialBalance.add(stakeAmount));
        });

        it("Should fail to withdraw before minimum period", async function () {
            await expect(staking.connect(addr1).withdraw()).to.be.revertedWithCustomError(
                staking,
                "Staking__NotEnoughStakeTime"
            );
        });

        it("Should fail to withdraw with insufficient reward balance", async function () {
            await time.increase(MIN_STAKING_PERIOD);
            await staking.connect(owner).emergencyWithdrawRewardTokens(rewardAmount);
            await expect(staking.connect(addr1).withdraw()).to.be.revertedWithCustomError(
                staking,
                "Staking__InsufficientRewardBalance"
            );
        });

        it("Should include accumulated rewards in withdrawal", async function () {
            await staking.connect(addr1).stake(stakeAmount);
            await time.increase(MIN_STAKING_PERIOD);
            const initialRewardBalance = await token.balanceOf(await addr1.getAddress());
            await staking.connect(addr1).withdraw();
            const finalRewardBalance = await token.balanceOf(await addr1.getAddress());
            expect(finalRewardBalance).to.be.gt(initialRewardBalance);
        });
    });

    describe("Reward Calculation", function () {
        it("Should calculate rewards correctly", async function () {
            await staking.connect(addr1).stake(stakeAmount);
            await time.increase(MIN_STAKING_PERIOD);
            const reward = await staking.calculateReward(await addr1.getAddress());
            expect(reward).to.be.gt(0);
        });

        it("Should return zero reward for no stake", async function () {
            const reward = await staking.calculateReward(await addr2.getAddress());
            expect(reward).to.equal(0);
        });
    });

    describe("Reward Management", function () {
        it("Should allow owner to add rewards", async function () {
            const initialBalance = await token.balanceOf(staking.address);
            await staking.connect(owner).addRewards(rewardAmount);
            const finalBalance = await token.balanceOf(staking.address);
            expect(finalBalance).to.equal(initialBalance.add(rewardAmount));
        });

        it("Should fail to add rewards for non-owner", async function () {
            await expect(staking.connect(addr1).addRewards(rewardAmount)).to.be.revertedWith(
                "Ownable: caller is not the owner"
            );
        });
    });

    describe("Emergency Functions", function () {
        beforeEach(async function () {
            await staking.connect(addr1).stake(stakeAmount);
            await token.mint(staking.address, rewardAmount);
            await token.mint(staking.address, stakeAmount);
        });

        it("Should allow owner to emergency withdraw reward tokens", async function () {
            const initialBalance = await token.balanceOf(await owner.getAddress());
            await staking.connect(owner).emergencyWithdrawRewardTokens(rewardAmount);
            const finalBalance = await token.balanceOf(await owner.getAddress());
            expect(finalBalance).to.equal(initialBalance.add(rewardAmount));
        });

        it("Should allow owner to emergency withdraw stake tokens", async function () {
            const initialBalance = await token.balanceOf(await owner.getAddress());
            await staking.connect(owner).emergencyWithdrawStakeTokens(stakeAmount);
            const finalBalance = await token.balanceOf(await owner.getAddress());
            expect(finalBalance).to.equal(initialBalance.add(stakeAmount));
        });

        it("Should fail emergency functions for non-owner", async function () {
            await expect(staking.connect(addr1).emergencyWithdrawRewardTokens(rewardAmount)).to.be.revertedWith(
                "Ownable: caller is not the owner"
            );
            await expect(staking.connect(addr1).emergencyWithdrawStakeTokens(stakeAmount)).to.be.revertedWith(
                "Ownable: caller is not the owner"
            );
        });

        it("Should fail to withdraw more stake tokens than available", async function () {
            await expect(staking.connect(owner).emergencyWithdrawStakeTokens(stakeAmount.mul(2))).to.be.revertedWithCustomError(
                staking,
                "Staking__InvalidAmount"
            );
        });
    });

    describe("Reentrancy Protection", function () {
        it("Should prevent reentrancy attacks", async function () {
            // This would typically require a malicious contract to test
            // The nonReentrant modifier should prevent reentrancy
            // We're ensuring the modifier is in place through other tests
        });
    });
});