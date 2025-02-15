const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");

  describe("PiggyBankMonaLinks", function () {

    let _withdrawalDate
    async function deployPiggyBank() {


        const [ owner, otherAccount] = await ethers.getSigners();

        const piggyBankMona = await ethers.getContractFactory("PiggyBank")

        const _targetAmount = ethers.parseEther("5")
        const DAY_IN_SECS = 7 * 24 * 60 * 60;

        _withdrawalDate = (await time.latest()) + DAY_IN_SECS;

        const _manager = owner.address

        const piggyBank = await piggyBankMona.deploy(_targetAmount, _withdrawalDate, _manager);

        return { piggyBank, owner, otherAccount };
    }

    describe("Deployment", function () {
        it("It should deploy the piggybank contract", async () => {
            const { piggyBank, owner, otherAccount} = await loadFixture(deployPiggyBank);
            expect(await piggyBank.targetAmount()).to.be.equal(ethers.parseEther("5"))
        })
    });

    describe("WithdrawDate", function () {
        it("The withdrawal date is in the feature", async () => {
            const { piggyBank, owner, otherAccount} = await loadFixture(deployPiggyBank);
            expect(await piggyBank.withdrawalDate()).to.equal(_withdrawalDate);
        })
    });

    describe("contributorsCount", function () {
        it("The count should be zero", async () => {
            const { piggyBank, owner, otherAccount} = await loadFixture(deployPiggyBank);
            expect(await piggyBank.contributorsCount()).to.be.equal(0);
        })
    });

    describe("Manager", function () {
        it("The manger address should be equal to owner address", async () => {
            const { piggyBank, owner, otherAccount} = await loadFixture(deployPiggyBank);
            expect(await piggyBank.manager()).to.be.equal(owner.address);
        })
    });


    describe("Save", function () {

        // it("it should revert with UNAUTHORIZED ADDRESS", async () => {
        //     const { piggyBank } = await loadFixture(deployPiggyBank);
        //     await expect(piggyBank.save({ value: ethers.parseEther("0.5")})).to.be.revertedWith("UNAUTHORIZED ADDRESS")
        // })

        it("it should revert YOU CAN NO LONGER SAVE", async () => {
            const { piggyBank, owner, otherAccount} = await loadFixture(deployPiggyBank);

            await time.increaseTo(_withdrawalDate, 1)
            await expect(piggyBank.connect(owner).save({ value: 0 }))
                .to.be.revertedWith("YOU CAN NO LONGER SAVE");
        })

        it("it should revert YOU ARE BROKE", async () => {
            const { piggyBank, owner, otherAccount} = await loadFixture(deployPiggyBank);

            await expect(piggyBank.connect(owner).save({ value: 0 }))
                .to.be.revertedWith("YOU ARE BROKE");
        });

        it("it should pass save money", async () => {
            const { piggyBank, owner, otherAccount} = await loadFixture(deployPiggyBank);

            // await expect(piggyBank.connect(owner).save({ value: ethers.parseEther("5") })).to.emit(piggyBank, "Contributed").withArgs(
            //     owner.address, ethers.parseEther("5"), await time.latest())
        });

        
    });

    describe("Withdraw", function () {
        it("it should revert with NOT YET TIME", async () => {
            const { piggyBank, owner, otherAccount} = await loadFixture(deployPiggyBank);

            await expect(piggyBank.connect(owner).withdrawal()).to.be.revertedWith("NOT YET TIME");
        });

        it("should allow withdrawal after the withdrawal date", async function () {
            const { piggyBank, owner } = await loadFixture(deployPiggyBank);

            await time.increaseTo(_withdrawalDate,1); // Move time past the withdrawal date

            
            await expect(piggyBank.connect(owner).withdrawal()).not.to.be.revertedWith("TARGET AMOUNT NOT REACHED");
        });
    });


  })