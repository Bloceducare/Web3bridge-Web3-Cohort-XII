const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
// const ethers = require("ethers");

describe("PiggyBank", function () {
  async function deployPiggyBank() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const PiggyBank = await ethers.getContractFactory("PiggyBankMine");
    const piggyBank = await PiggyBank.deploy();

    return { piggyBank, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should deploy the PiggyBank contract", async function () {
      const { piggyBank, owner } = await loadFixture(deployPiggyBank);
      expect(await piggyBank.checkBalance(owner.address)).to.equal(0);
    });
  });

  describe("Deposit", function () {
    it("it should revert if the user did not deposit", async function () {
        const { piggyBank, owner } = await loadFixture(deployPiggyBank);
        await expect(piggyBank.deposit({ value: 0})).to.be.revertedWith("You must deposit some Ether")
    })
  })
  describe("Withdram", function () {
    it("it should revert if the amount is zero", async function () {
        const { piggyBank, owner } = await loadFixture(deployPiggyBank);
        await expect(piggyBank.withdraw(0)).to.be.revertedWith("You must withdraw amount greater than 0")
    })
  })
  describe("WithdrawAmount-Revert", function () {
    it("it should revert insufficient balance", async function () {
        const { piggyBank, owner } = await loadFixture(deployPiggyBank);

        await piggyBank.deposit({value: ethers.parseEther(`1.1`)})

        const amountWithdraw = ethers.parseEther(`2.0`);

        await expect(piggyBank.withdraw(amountWithdraw)).to.be.revertedWith("Insufficient balance")
    })
  });
  describe("Withdraw", function () {
    it("it should pass successfully withdraw", async function () {
        const { piggyBank, owner } = await loadFixture(deployPiggyBank);

        await piggyBank.deposit({value: ethers.parseEther(`1.1`)})

        const amountWithdraw = ethers.parseEther(`1.1`);

        const withdraw = await piggyBank.withdraw(amountWithdraw);

        const txreceipt = await withdraw.wait();

        const balance = await piggyBank.checkBalance(owner.address); 

        await expect(balance).to.equal(ethers.parseEther(`0.0`));
    })
  });

  describe("CheckBalance", function () {
    it("it should check balance", async function () {
        const { piggyBank, owner } = await loadFixture(deployPiggyBank);

        await piggyBank.deposit({value: ethers.parseEther(`1.1`)})

        const balance = await piggyBank.checkBalance(owner.address); 

        expect(balance).to.equal(ethers.parseEther("1.1"));
    })
  });


});
