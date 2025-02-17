import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";

describe("PiggyBank", () => {
  async function deployPiggyBankFixture() {
    const [owner, address1] = await hre.ethers.getSigners();
    const piggyBankFactory = await hre.ethers.getContractFactory("PiggyBank");

    const duration = 60 * 60;
    const latestTime = await time.latest();
    const _time = latestTime + duration;

    const piggyBank = await piggyBankFactory.deploy(1e9, _time, owner.address);
    return { piggyBank, latestTime, owner, address1 };
  }

  describe("Deployment", () => {
    it("Should deploy PiggyBank contract", async () => {
      const { piggyBank, owner } = await loadFixture(deployPiggyBankFixture);

      expect(await piggyBank.manager()).to.equal(owner.address);
    });
    it("Should set the right unlockTime", async () => {
      const { piggyBank } = await loadFixture(deployPiggyBankFixture);
      const unlockTime = await piggyBank.withdrawalDate();
      const unlockDate = new Date(Number(unlockTime) * 1000);

      const unlockHour = unlockDate.getHours();

      const durationDate = new Date(((await time.latest()) + 60 * 60) * 1000);

      const durationHour = durationDate.getHours();

      expect(unlockHour).to.equal(durationHour);
    });
    it("should set target amount correctly", async () => {
      const { piggyBank } = await loadFixture(deployPiggyBankFixture);
      expect(await piggyBank.targetAmount()).to.equal(1e9);
    });
  });

  describe("Save", () => {
    it("Should save money", async () => {
      const { piggyBank, owner } = await loadFixture(deployPiggyBankFixture);
      const amount = 1e9;
      await piggyBank.save({ value: amount });
      const balance = await hre.ethers.provider.getBalance(piggyBank.target);
      expect(balance).to.equal(amount);
    });

    it("Should save money if not manager", async () => {
      const { piggyBank, address1 } = await loadFixture(deployPiggyBankFixture);
      const amount = 1e9;
      await piggyBank.connect(address1).save({ value: amount });
      const balance = await hre.ethers.provider.getBalance(piggyBank.target);
      expect(balance).to.equal(amount);
    });

    it("should not accept savings after withdrawal date", async () => {
      const { piggyBank } = await loadFixture(deployPiggyBankFixture);
      const amount = 1e9;
      await time.increase(60 * 60 + 1);
      await expect(piggyBank.save({ value: amount })).to.be.revertedWith(
        "YOU CAN NO LONGER SAVE"
      );
    });

    it("should not accept value less than or equal to 0", async () => {
      const { piggyBank } = await loadFixture(deployPiggyBankFixture);
      const amount = 0;
      await expect(piggyBank.save({ value: amount })).to.be.revertedWith(
        "YOU ARE BROKE"
      );
    });

    it("increase contributors count", async () => {
      const { piggyBank, owner, address1 } = await loadFixture(
        deployPiggyBankFixture
      );
      const amount = 1e9;
      await piggyBank.save({ value: amount });
      await piggyBank.connect(address1).save({ value: amount });
      const contributorCount = await piggyBank.contributorsCount();
      expect(contributorCount).to.equal(2);
    });

    it("increase contributors count once for a contributor regardless multiple savings", async () => {
      const { piggyBank } = await loadFixture(deployPiggyBankFixture);
      const amount = 1e9;
      await piggyBank.save({ value: amount });
      await piggyBank.save({ value: amount });
      const contributorCount = await piggyBank.contributorsCount();
      expect(contributorCount).to.equal(1);
    });

    it("contribution mapping is updated", async () => {
      const { piggyBank, owner } = await loadFixture(deployPiggyBankFixture);
      const amount = 1e9;
      await piggyBank.save({ value: amount });
      const contribution = await piggyBank.contributions(owner.address);
      expect(contribution).to.equal(amount);
    });

    it("Contributed Event is emitted", async () => {
      const { piggyBank, owner, address1 } = await loadFixture(
        deployPiggyBankFixture
      );
      const amount = 1e9;
      await expect(piggyBank.save({ value: amount })).to.emit(
        piggyBank,
        "Contributed"
      );
    });
  });

  describe("Withdraw", () => {
    it("Should withdraw money", async () => {
      const { piggyBank, address1 } = await loadFixture(deployPiggyBankFixture);
      const amount = 1e9;
      await piggyBank.connect(address1).save({ value: amount });
      await time.increase(60 * 60 + 1);
      await piggyBank.withdrawal();
      const balance = await hre.ethers.provider.getBalance(piggyBank.target);
      const ownerBalanceAfter = await hre.ethers.provider.getBalance(
        piggyBank.manager()
      );
      expect(balance).to.equal(0);
      const balanceBeforeAdded = ownerBalanceAfter - BigInt(amount);
      expect(ownerBalanceAfter).to.equal(balanceBeforeAdded + BigInt(amount));
    });

    it("Should not withdraw money if not manager", async () => {
      const { piggyBank, address1 } = await loadFixture(deployPiggyBankFixture);
      const amount = 1e9;
      await piggyBank.connect(address1).save({ value: amount });
      await time.increase(60 * 60 + 1);
      await expect(piggyBank.connect(address1).withdrawal()).to.be.revertedWith(
        "YOU WAN THIEF ABI ?"
      );
    });

    it("Should not withdraw money before withdrawal date", async () => {
      const { piggyBank, address1 } = await loadFixture(deployPiggyBankFixture);
      const amount = 1e9;
      await piggyBank.connect(address1).save({ value: amount });
      await expect(piggyBank.withdrawal()).to.be.revertedWith("NOT YET TIME");
    });

    it("Should not withdraw money if target amount is not reached", async () => {
      const { piggyBank, address1 } = await loadFixture(deployPiggyBankFixture);
      const amount = 1e6;
      await piggyBank.connect(address1).save({ value: amount });
      await time.increase(60 * 60 + 1);
      await expect(piggyBank.withdrawal()).to.be.revertedWith(
        "TARGET AMOUNT NOT REACHED"
      );
    });

    it("Should emit Withdrawn event", async () => {
      const { piggyBank, address1 } = await loadFixture(deployPiggyBankFixture);
      const amount = 1e9;
      await piggyBank.connect(address1).save({ value: amount });
      await time.increase(60 * 60 + 1);
      await expect(piggyBank.withdrawal()).to.emit(piggyBank, "Withdrawn");
    });
  });
});
