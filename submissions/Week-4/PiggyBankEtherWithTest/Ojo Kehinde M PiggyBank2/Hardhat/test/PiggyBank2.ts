import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("PiggyBank Contract", function () {
    async function deployPiggyBankFixture() {
        const [manager, user1, user2] = await ethers.getSigners();

        const targetAmount = ethers.parseEther("5");
        const withdrawalDate = (await time.latest()) + 300; 

        // Deploy PiggyBank Contract
        const PiggyBank = await ethers.getContractFactory("PiggyBank2");
        const piggyBank = await PiggyBank.deploy(targetAmount, withdrawalDate, manager.address);
        await piggyBank.waitForDeployment();

        return { piggyBank, manager, user1, user2, targetAmount, withdrawalDate };
    }

    // Testing for all scenarios
    describe("Deployment", function () {
        it("Should deploy correctly and set initial values", async function () {
            const { piggyBank, manager, withdrawalDate, targetAmount } = await loadFixture(deployPiggyBankFixture);

            expect(await piggyBank.manager()).to.equal(manager.address);
            expect(await piggyBank.withdrawalDate()).to.equal(withdrawalDate);
            expect(await piggyBank.targetAmount()).to.equal(targetAmount);
        });
    });

    describe("Saving Contributions", function () {
        it("Should allow users to save money", async function () {
            const { piggyBank, user1 } = await loadFixture(deployPiggyBankFixture);
            const saveAmount = ethers.parseEther("2");

            const tx = await piggyBank.connect(user1).save({ value: saveAmount });

            
            const latestTime = await time.latest();

            await expect(tx)
                .to.emit(piggyBank, "Contributed")
                .withArgs(user1.address, saveAmount, latestTime);

            expect(await piggyBank.contributions(user1.address)).to.equal(saveAmount);
        });

        it("Should increase contributor count when a new user contributes", async function () {
            const { piggyBank, user1, user2 } = await loadFixture(deployPiggyBankFixture);

            await piggyBank.connect(user1).save({ value: ethers.parseEther("1") });
            await piggyBank.connect(user2).save({ value: ethers.parseEther("1") });

            expect(await piggyBank.contributorsCount()).to.equal(2);
        });

        it("Should not allow zero contribution", async function () {
            const { piggyBank, user1 } = await loadFixture(deployPiggyBankFixture);

            await expect(piggyBank.connect(user1).save({ value: 0 })).to.be.revertedWith("YOU ARE BROKE");
        });
    });

    describe("Withdrawals", function () {
        it("Should allow the manager to withdraw after the withdrawal date", async function () {
            const { piggyBank, manager, user1, targetAmount, withdrawalDate } = await loadFixture(deployPiggyBankFixture);

           
            await piggyBank.connect(user1).save({ value: targetAmount });

            
            await time.increaseTo(withdrawalDate + 1);

            const tx = await piggyBank.withdrawal();

           
            const latestTime = await time.latest();

            await expect(tx)
                .to.emit(piggyBank, "Withdrawn")
                .withArgs(targetAmount, latestTime);

            
            expect(await ethers.provider.getBalance(piggyBank.getAddress())).to.equal(0);
            expect(await ethers.provider.getBalance(manager.address)).to.be.above(ethers.parseEther("0")); 
        });

        it("Should not allow withdrawal before the withdrawal date", async function () {
            const { piggyBank } = await loadFixture(deployPiggyBankFixture);
            await expect(piggyBank.withdrawal()).to.be.revertedWith("NOT YET TIME");
        });

        it("Should not allow withdrawal if target amount is not reached", async function () {
            const { piggyBank, withdrawalDate } = await loadFixture(deployPiggyBankFixture);

            
            await time.increaseTo(withdrawalDate + 1);

            await expect(piggyBank.withdrawal()).to.be.revertedWith("TARGET AMOUNT NOT REACHED");
        });

        it("Should only allow the manager to withdraw", async function () {
            const { piggyBank, user1, withdrawalDate, targetAmount } = await loadFixture(deployPiggyBankFixture);

            
            await piggyBank.connect(user1).save({ value: targetAmount });

            
            await time.increaseTo(withdrawalDate + 1);

            await expect(piggyBank.connect(user1).withdrawal()).to.be.reverted;
        });
    });
});