import { time, loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import hre from "hardhat";
import { expect } from "chai";

describe("PiggyBank Test", () => {
    async function deployPiggyBankFixture() {
        const [manager, account1, account2] = await hre.ethers.getSigners();
        const targetAmount = hre.ethers.parseEther("5"); //This means the piggy bank has a goal of 5 ETH before we can take the money out. 💰

        
        const withdrawalDate = (await time.latest()) + 3600; //+ 3600: Adds 1 hour (3600 seconds) before money can be taken out.

        const PiggyBank = await hre.ethers.getContractFactory("PiggyBank");
        const piggyBank = await PiggyBank.deploy(targetAmount, withdrawalDate, manager.address); //We build the piggy bank and give it rules:

        //targetAmount (goal: 5 ETH)
        //withdrawalDate (time when money can be taken out)
        //manager.address (only the boss can take money out)
        
       return { piggyBank, manager, account1, account2, targetAmount, withdrawalDate };
    }

    describe("Deployment", () => {
        it("Should deploy with correct values", async () => {
            const { piggyBank, manager, targetAmount, withdrawalDate } = await loadFixture(deployPiggyBankFixture); //We are testing if the piggy bank is created with the right values.

            expect(await piggyBank.targetAmount()).to.equal(targetAmount);
            expect(await piggyBank.withdrawalDate()).to.equal(withdrawalDate);
            expect(await piggyBank.manager()).to.equal(manager.address);
        });
    });

    describe("Saving Money", () => {
        it("Should allow users to save money", async () => {
            const { piggyBank, account1 } = await loadFixture(deployPiggyBankFixture);
            const depositAmount = hre.ethers.parseEther("1");

            await expect(piggyBank.connect(account1).save({ value: depositAmount }))
                .to.emit(piggyBank, "Contributed")
                .withArgs(account1.address, depositAmount, await time.latest() + 1);

            expect(await piggyBank.contributions(account1.address)).to.equal(depositAmount);
        });
    });

    describe("Withdraw Funds", () => {
        it("Should allow manager to withdraw after withdrawal date", async () => {
            const { piggyBank, manager, account1, targetAmount } = await loadFixture(deployPiggyBankFixture);

            await piggyBank.connect(account1).save({ value: targetAmount });
            await time.increaseTo(await piggyBank.withdrawalDate());

            await expect(piggyBank.connect(manager).withdrawal())
                .to.emit(piggyBank, "Withdrawn")
                .withArgs(targetAmount, await time.latest() + 1);
        });

        it("Should NOT allow withdrawal before the time", async () => {
            const { piggyBank, manager } = await loadFixture(deployPiggyBankFixture);
            await expect(piggyBank.connect(manager).withdrawal()).to.be.revertedWith("NOT YET TIME");
        });

        it("Should NOT allow withdrawal if target amount is not reached", async () => {
            const { piggyBank, manager, account1 } = await loadFixture(deployPiggyBankFixture);
            
            await piggyBank.connect(account1).save({ value: hre.ethers.parseEther("1") });
            await time.increaseTo(await piggyBank.withdrawalDate());
            
            await expect(piggyBank.connect(manager).withdrawal()).to.be.revertedWith("TARGET AMOUNT NOT REACHED");
        });

        it("Should NOT allow non-managers to withdraw", async () => {
            const { piggyBank, account1 } = await loadFixture(deployPiggyBankFixture);
            await expect(piggyBank.connect(account1).withdrawal()).to.be.revertedWith("YOU WAN THIEF ABI ?");
        });
    });
});