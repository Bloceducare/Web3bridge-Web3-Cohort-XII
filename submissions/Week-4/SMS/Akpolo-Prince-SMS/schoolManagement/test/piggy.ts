const { time, loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PiggyBank", function () {
    const deployPiggyBankContract = async () => {
        const [owner, depositor1, depositor2] = await ethers.getSigners();
        const PiggyBank = await ethers.getContractFactory("PiggyBank");
        const piggyBankContract = await PiggyBank.deploy();
        return { piggyBankContract, owner, depositor1, depositor2 };
    };

    describe("Deployment", function () {
        it("should set the owner correctly", async function () {
            const { piggyBankContract, owner } = await loadFixture(deployPiggyBankContract);
            expect(await piggyBankContract.owner()).to.equal(owner.address);
        });
    });

    describe("Deposit Functionality", function () {
        it("should allow users to deposit money with a future deadline", async function () {
            const { piggyBankContract, depositor1 } = await loadFixture(deployPiggyBankContract);

            const depositAmount = ethers.parseEther("1"); 
            const deadline = (await time.latest()) + 3600; // 1 hour in the future

            await piggyBankContract.connect(depositor1).deposit(deadline, { value: depositAmount });

            const piggyDetails = await piggyBankContract.piggyBanks(depositor1.address);
            expect(piggyDetails.pledgeAmount).to.equal(depositAmount);
            expect(piggyDetails.deadline).to.equal(deadline);
            expect(piggyDetails.withdrawn).to.be.false;
        });

        it("should reject deposits with invalid deadlines", async function () {
            const { piggyBankContract, depositor1 } = await loadFixture(deployPiggyBankContract);

            const depositAmount = ethers.parseEther("1"); 
            const invalidDeadline = (await time.latest()) - 3600; // 1 hour in the past

            await expect(
                piggyBankContract.connect(depositor1).deposit(invalidDeadline, { value: depositAmount })
            ).to.be.revertedWith("Deadline must be in the future");
        });

        it("should reject deposits with zero amount", async function () {
            const { piggyBankContract, depositor1 } = await loadFixture(deployPiggyBankContract);

            const deadline = (await time.latest()) + 3600; // 1 hour in the future

            await expect(
                piggyBankContract.connect(depositor1).deposit(deadline, { value: 0 })
            ).to.be.revertedWith("Deposit amount must be greater than zero");
        });

        it("should reject multiple active deposits from the same user", async function () {
            const { piggyBankContract, depositor1 } = await loadFixture(deployPiggyBankContract);

            const depositAmount = ethers.parseEther("1"); // 1 Ether
            const deadline = (await time.latest()) + 3600; // 1 hour in the future

            // First deposit
            await piggyBankContract.connect(depositor1).deposit(deadline, { value: depositAmount });

            // Attempt second deposit
            await expect(
                piggyBankContract.connect(depositor1).deposit(deadline, { value: depositAmount })
            ).to.be.revertedWith("Existing deposit active");
        });
    });

    describe("Withdraw Functionality", function () {
        it("should allow users to withdraw after the deadline", async function () {
            const { piggyBankContract, depositor1 } = await loadFixture(deployPiggyBankContract);

            const depositAmount = ethers.parseEther("1"); // 1 Ether
            const deadline = (await time.latest()) + 3600; // 1 hour in the future

            // Deposit funds
            await piggyBankContract.connect(depositor1).deposit(deadline, { value: depositAmount });

            // Move time forward to after the deadline
            await time.increaseTo(deadline + 1);

            // Withdraw funds
            await expect(piggyBankContract.connect(depositor1).withdraw())
                .to.emit(piggyBankContract, "MoneyWithdrawn")
                .withArgs(depositor1.address, depositAmount);

            const piggyDetails = await piggyBankContract.piggyBanks(depositor1.address);
            expect(piggyDetails.withdrawn).to.be.true;
        });

        it("should reject withdrawals before the deadline", async function () {
            const { piggyBankContract, depositor1 } = await loadFixture(deployPiggyBankContract);

            const depositAmount = ethers.parseEther("1"); // 1 Ether
            const deadline = (await time.latest()) + 3600; // 1 hour in the future

            await piggyBankContract.connect(depositor1).deposit(deadline, { value: depositAmount });

           
            await expect(piggyBankContract.connect(depositor1).withdraw()).to.be.revertedWith(
                "Cannot withdraw before deadline"
            );
        });

        it("should reject withdrawals if already withdrawn", async function () {
            const { piggyBankContract, depositor1 } = await loadFixture(deployPiggyBankContract);

            const depositAmount = ethers.parseEther("1"); // 1 Ether
            const deadline = (await time.latest()) + 3600; // 1 hour in the future

          
            await piggyBankContract.connect(depositor1).deposit(deadline, { value: depositAmount });

            // Move time forward to after the deadline
            await time.increaseTo(deadline + 1);

        
            await piggyBankContract.connect(depositor1).withdraw();

            
            await expect(piggyBankContract.connect(depositor1).withdraw()).to.be.revertedWith("Already withdrawn");
        });

        it("should reject withdrawals without an active deposit", async function () {
            const { piggyBankContract, depositor1 } = await loadFixture(deployPiggyBankContract);

            await expect(piggyBankContract.connect(depositor1).withdraw()).to.be.revertedWith("No active deposit");
        });
    });

    describe("Check Balance Functionality", function () {
        it("should return the correct balance for a depositor", async function () {
            const { piggyBankContract, depositor1 } = await loadFixture(deployPiggyBankContract);

            const depositAmount = ethers.parseEther("1"); 
            const deadline = (await time.latest()) + 3600; // 1 hour in the future

            
            await piggyBankContract.connect(depositor1).deposit(deadline, { value: depositAmount });

            
            const balance = await piggyBankContract.connect(depositor1).checkBalance();
            expect(balance).to.equal(depositAmount);
        });

        it("should return 0 for users without an active deposit", async function () {
            const { piggyBankContract, depositor1 } = await loadFixture(deployPiggyBankContract);

            const balance = await piggyBankContract.connect(depositor1).checkBalance();
            expect(balance).to.equal(0);
        });
    });
});