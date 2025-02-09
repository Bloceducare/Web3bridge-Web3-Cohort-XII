const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("PiggyBank", function () {
    const TARGET_AMOUNT = ethers.parseEther("1"); // 1 ETH
    const ONE_DAY = 24 * 60 * 60; // 1 day in seconds
    
    beforeEach(async function () {
        // Get signers
        const [owner, addr1, addr2, manager] = await ethers.getSigners();
        
        // Get current timestamp
        const currentTimestamp = await time.latest();
        const withdrawalDate = currentTimestamp + ONE_DAY;
        
        // Deploy contract
        const PiggyBank = await ethers.getContractFactory("PiggyBank");
        this.piggyBank = await PiggyBank.deploy(TARGET_AMOUNT, withdrawalDate, manager.address);
        this.owner = owner;
        this.addr1 = addr1;
        this.addr2 = addr2;
        this.manager = manager;
    });

    describe("Deployment", function () {
        it("Should set the correct target amount", async function () {
            expect(await this.piggyBank.targetAmount()).to.equal(TARGET_AMOUNT);
        });

        it("Should set the correct manager", async function () {
            expect(await this.piggyBank.manager()).to.equal(this.manager.address);
        });

        it("Should fail if withdrawal date is in the past", async function () {
            const currentTimestamp = await time.latest();
            const PiggyBank = await ethers.getContractFactory("PiggyBank");
            await expect(PiggyBank.deploy(
                TARGET_AMOUNT, 
                currentTimestamp - ONE_DAY, 
                this.manager.address
            )).to.be.revertedWith("WITHDRAWAL MUST BE IN FUTURE");
        });
    });

    describe("Saving", function () {
        it("Should allow users to save ETH", async function () {
            const saveAmount = ethers.parseEther("0.5");
            await this.piggyBank.connect(this.addr1).save({ value: saveAmount });
            
            expect(await this.piggyBank.contributions(this.addr1.address)).to.equal(saveAmount);
        });

        it("Should increment contributors count for new contributors", async function () {
            expect(await this.piggyBank.contributorsCount()).to.equal(0);
            
            await this.piggyBank.connect(this.addr1).save({ value: ethers.parseEther("0.1") });
            expect(await this.piggyBank.contributorsCount()).to.equal(1);
            
            await this.piggyBank.connect(this.addr1).save({ value: ethers.parseEther("0.1") });
            expect(await this.piggyBank.contributorsCount()).to.equal(1);
        });

        it("Should emit Contributed event", async function () {
            const saveAmount = ethers.parseEther("0.5");
            await expect(this.piggyBank.connect(this.addr1).save({ value: saveAmount }))
                .to.emit(this.piggyBank, "Contributed")
                .withArgs(this.addr1.address, saveAmount, await time.latest());
        });

        it("Should fail if trying to save 0 ETH", async function () {
            await expect(this.piggyBank.connect(this.addr1).save({ value: 0 }))
                .to.be.revertedWith("YOU ARE BROKE");
        });

        it("Should fail if saving after withdrawal date", async function () {
            await time.increase(ONE_DAY + 1);
            await expect(this.piggyBank.connect(this.addr1).save({ value: ethers.parseEther("0.5") }))
                .to.be.revertedWith("YOU CAN NO LONGER SAVE");
        });
    });

    describe("Withdrawal", function () {
        it("Should allow manager to withdraw when conditions are met", async function () {
            await this.piggyBank.connect(this.addr1).save({ value: TARGET_AMOUNT });
            await time.increase(ONE_DAY + 1);
            
            const beforeBalance = await ethers.provider.getBalance(this.manager.address);
            await this.piggyBank.connect(this.manager).withdrawal();
            const afterBalance = await ethers.provider.getBalance(this.manager.address);
            
            expect(afterBalance - beforeBalance).to.be.closeTo(
                TARGET_AMOUNT,
                ethers.parseEther("0.01")
            );
        });

        it("Should emit Withdrawn event", async function () {
            await this.piggyBank.connect(this.addr1).save({ value: TARGET_AMOUNT });
            await time.increase(ONE_DAY + 1);
            
            await expect(this.piggyBank.connect(this.manager).withdrawal())
                .to.emit(this.piggyBank, "Withdrawn")
                .withArgs(TARGET_AMOUNT, await time.latest());
        });

        it("Should fail if withdrawal date hasn't passed", async function () {
            await this.piggyBank.connect(this.addr1).save({ value: TARGET_AMOUNT });
            
            await expect(this.piggyBank.connect(this.manager).withdrawal())
                .to.be.revertedWith("NOT YET TIME");
        });

        it("Should fail if target amount hasn't been reached", async function () {
            await time.increase(ONE_DAY + 1);
            
            await expect(this.piggyBank.connect(this.manager).withdrawal())
                .to.be.revertedWith("TARGET AMOUNT NOT REACHED");
        });

        it("Should fail if called by non-manager", async function () {
            await this.piggyBank.connect(this.addr1).save({ value: TARGET_AMOUNT });
            await time.increase(ONE_DAY + 1);
            
            await expect(this.piggyBank.connect(this.addr1).withdrawal())
                .to.be.revertedWith("YOU WAN THIEF ABI ?");
        });
    });
});