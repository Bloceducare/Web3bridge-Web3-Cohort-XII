const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Staking Contract", function () {
    let dripToken, stakingContract;
    let owner, user1, user2;

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();

        const DripToken = await ethers.getContractFactory("DripToken");
        dripToken = await DripToken.deploy(owner.address);
        await dripToken.waitForDeployment();

        await dripToken.mint(user1.address, ethers.parseEther("1000"));
        await dripToken.mint(user2.address, ethers.parseEther("1000"));

        const Staking = await ethers.getContractFactory("Staking");
        stakingContract = await Staking.deploy(dripToken.target);
        await stakingContract.waitForDeployment();

        await dripToken.connect(user1).approve(stakingContract.target, ethers.parseEther("1000"));
        await dripToken.connect(user2).approve(stakingContract.target, ethers.parseEther("1000"));
    });

    describe("Staking Tokens", function () {
        it("Should allow users to stake tokens", async function () {
            const amount = ethers.parseEther("100");
            await stakingContract.connect(user1).stake(amount);

            expect(await dripToken.balanceOf(user1.address)).to.equal(ethers.parseEther("900"));
            expect(await stakingContract.stakedAmount(user1.address)).to.equal(amount);
            expect(await stakingContract.totalSupply()).to.equal(amount);
        });

        it("Should revert if staking amount is zero", async function () {
            await expect(
                stakingContract.connect(user1).stake(0)
            ).to.be.revertedWithCustomError(stakingContract, "InvalidAmount");
        });
    });

    describe("Unstaking Tokens", function () {
        beforeEach(async function () {
            const amount = ethers.parseEther("100");
            await stakingContract.connect(user1).stake(amount);
        });

        it("Should allow users to unstake tokens", async function () {
            const amount = ethers.parseEther("50");
            await stakingContract.connect(user1).unstake(amount);

            expect(await dripToken.balanceOf(user1.address)).to.equal(ethers.parseEther("950"));
            expect(await stakingContract.stakedAmount(user1.address)).to.equal(ethers.parseEther("50"));
            expect(await stakingContract.totalSupply()).to.equal(ethers.parseEther("50"));
        });

        it("Should revert if unstaking amount exceeds staked balance", async function () {
            await expect(
                stakingContract.connect(user1).unstake(ethers.parseEther("200"))
            ).to.be.revertedWithCustomError(stakingContract, "InsufficientBalance");
        });

        it("Should revert if unstaking amount is zero", async function () {
            await expect(
                stakingContract.connect(user1).unstake(0)
            ).to.be.revertedWithCustomError(stakingContract, "InvalidAmount");
        });
    });

    describe("Claiming Rewards", function () {
        beforeEach(async function () {
            const amount = ethers.parseEther("100");
            await stakingContract.connect(user1).stake(amount);

            await ethers.provider.send("evm_increaseTime", [10]);
            await ethers.provider.send("evm_mine", []);
        });

        it("Should allow users to claim rewards", async function () {
            const initialBalance = await dripToken.balanceOf(user1.address);
            await stakingContract.connect(user1).claimRewards();

            const expectedReward = ethers.parseUnits("0.1", 18);
            const finalBalance = await dripToken.balanceOf(user1.address);

            expect(ethers.BigNumber.from(finalBalance).sub(ethers.BigNumber.from(initialBalance))).to.equal(expectedReward);
            expect(await stakingContract.userRewards(user1.address)).to.equal(0);
        });

        it("Should revert if there are no rewards to claim", async function () {
            await stakingContract.connect(user1).claimRewards();

            await expect(
                stakingContract.connect(user1).claimRewards()
            ).to.be.revertedWithCustomError(stakingContract, "NoRewardsToClaim");
        });
    });

    describe("Reward Calculation", function () {
        it("Should calculate rewards correctly after multiple stakes and unstakes", async function () {
            const amount1 = ethers.parseEther("100");
            await stakingContract.connect(user1).stake(amount1);
            await ethers.provider.send("evm_increaseTime", [10]);
            await ethers.provider.send("evm_mine", []);

            const amount2 = ethers.parseEther("50");
            await stakingContract.connect(user1).unstake(amount2);

            const amount3 = ethers.parseEther("50");
            await stakingContract.connect(user1).stake(amount3);
            await ethers.provider.send("evm_increaseTime", [10]);
            await ethers.provider.send("evm_mine", []);

            await stakingContract.connect(user1).claimRewards();

            const expectedReward = ethers.parseUnits("0.15", 18);
            const finalBalance = await dripToken.balanceOf(user1.address);

            expect(ethers.BigNumber.from(finalBalance).sub(ethers.parseEther("900"))).to.equal(expectedReward);
        });
    });
});