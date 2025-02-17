import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import hre, { ethers } from "hardhat";
import { expect } from "chai";

describe("PiggyBank", () => {
    const deployPiggyBankContract = async () => {
        const bank = await hre.ethers.getContractFactory("PiggyBank");

        const [owner, account1, account2] = await hre.ethers.getSigners();

        const _targetAmount = ethers.parseEther("1");

        const _withdrawalDate = (await time.latest()) + 86400; // add one day to curent time

        const deployedBank = await bank.deploy(_targetAmount, _withdrawalDate, owner.address);

        return { deployedBank, owner, account1, account2 };
    };

    describe("Deployment", function () {
        it("should deploy with correct initial values", async function () {
            const { deployedBank, owner } = await loadFixture(deployPiggyBankContract);

            expect(await deployedBank.targetAmount()).to.equal(ethers.parseEther("1"));
            expect(await deployedBank.withdrawalDate()).to.be.above(await time.latest());
            expect(await deployedBank.manager()).to.equal(owner.address);
        });
    });

    describe("Save Functionality", function () {
        it("should allow users to contribute ETH", async function () {
            const { deployedBank, account1 } = await loadFixture(deployPiggyBankContract);

            const depositAmount = ethers.parseEther("1");

            // To make sure that the  Account1 deposits ETH
            const tx = await deployedBank.connect(account1).save({ value: depositAmount });

            //transaction to complete
            const receipt = await tx.wait();
            if (!receipt) {
                throw new Error("Transaction receipt is null.");
            }

            //to include the transaction
            const block = await ethers.provider.getBlock(receipt.blockNumber);
            if (!block) {
                throw new Error("Block data is null.");
            }


            // Validate the Contributed event with dynamically fetched timestamp
            await expect(tx)
                .to.emit(deployedBank, "Contributed")
                .withArgs(account1.address, depositAmount, block.timestamp);
        });


        it("should increase contributors count for new contributors", async function () {
            const { deployedBank, account1, account2 } = await loadFixture(deployPiggyBankContract);

            const depositAmount = ethers.parseEther("0.5");

            await deployedBank.connect(account1).save({ value: depositAmount });
            await deployedBank.connect(account2).save({ value: depositAmount });

            const count = await deployedBank.contributorsCount();
            expect(count).to.equal(2);
        });

        it("should not allow contributions after withdrawal date", async function () {
            const { deployedBank, account1 } = await loadFixture(deployPiggyBankContract);

            // Move time past withdrawal date
            await time.increaseTo((await deployedBank.withdrawalDate()) + BigInt(1));

            await expect(deployedBank.connect(account1).save({ value: ethers.parseEther("0.5") }))
                .to.be.revertedWith("YOU CAN NO LONGER SAVE");
        });
    });

    describe("Withdrawal Functionality", function () {
        it("should allow the manager to withdraw when conditions are met", async function () {
            const { deployedBank, owner, account1 } = await loadFixture(deployPiggyBankContract);

            const depositAmount = ethers.parseEther("1");

            // Account1 deposits ETH
            await deployedBank.connect(account1).save({ value: depositAmount });

            // Move time past withdrawal date
            await time.increaseTo((await deployedBank.withdrawalDate()) + BigInt(1));

            // Check contract balance before withdrawal
            expect(await ethers.provider.getBalance(deployedBank.target)).to.equal(depositAmount);

            // Call withdrawal
            const tx = await deployedBank.connect(owner).withdrawal();
            const receipt = await tx.wait();

            if (!receipt || !receipt.blockNumber) {
                throw new Error("Transaction receipt is null.");
            }

            const block = await ethers.provider.getBlock(receipt.blockNumber);
            if (!block) {
                throw new Error("Block data is null.");
            }

            // Validate contract balance is zero after withdrawal
            expect(await ethers.provider.getBalance(deployedBank.target)).to.equal(0);

            // Validate the Withdrawn event
            await expect(tx)
                .to.emit(deployedBank, "Withdrawn")
                .withArgs(depositAmount, block.timestamp);
        });


        it("should prevent non-managers from withdrawing", async function () {
            const { deployedBank, account1 } = await loadFixture(deployPiggyBankContract);

            await expect(deployedBank.connect(account1).withdrawal())
                .to.be.revertedWith("YOU WAN THIEF ABI ?");
        });

        it("should not allow withdrawal before the withdrawal date", async function () {
            const { deployedBank, owner, account1 } = await loadFixture(deployPiggyBankContract);

            const depositAmount = ethers.parseEther("1");

            // Account1 deposits ETH
            await deployedBank.connect(account1).save({ value: depositAmount });

            // Attempt to withdraw before withdrawal date
            await expect(deployedBank.connect(owner).withdrawal())
                .to.be.revertedWith("NOT YET TIME");
        });

        it("should not allow withdrawal if the target amount is not reached", async function () {
            const { deployedBank, owner, account1 } = await loadFixture(deployPiggyBankContract);

            // Account1 deposits only 0.5 ETH (target is 1 ETH)
            await deployedBank.connect(account1).save({ value: ethers.parseEther("0.5") });

            // Move time past withdrawal date
            await time.increaseTo((await deployedBank.withdrawalDate()) + BigInt(1));

            // Attempt withdrawal
            await expect(deployedBank.connect(owner).withdrawal())
                .to.be.revertedWith("TARGET AMOUNT NOT REACHED");
        });
    });
});
