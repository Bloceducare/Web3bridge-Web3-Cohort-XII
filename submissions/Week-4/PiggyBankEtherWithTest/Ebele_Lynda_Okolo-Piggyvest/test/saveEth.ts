import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";

describe("PiggyBank", function () {
  async function deployPiggyBankFixture() {
    const [manager, contributor1, contributor2] = await hre.ethers.getSigners();
    const targetAmount = hre.ethers.parseEther("5");
    const withdrawalDate = (await time.latest()) + 7 * 24 * 60 * 60; // 7 days later

    const PiggyBank = await hre.ethers.getContractFactory("PiggyBank");
    const piggyBank = await PiggyBank.deploy(
      targetAmount,
      withdrawalDate,
      manager.address
    );
    await piggyBank.waitForDeployment();

    return {
      piggyBank,
      manager,
      contributor1,
      contributor2,
      targetAmount,
      withdrawalDate,
    };
  }

  describe("Deployment", function () {
    it("Should set the manager correctly", async function () {
      const { piggyBank, manager } = await loadFixture(deployPiggyBankFixture);
      expect(await piggyBank.manager()).to.equal(manager.address);
    });
  });

  describe("Saving", function () {
    it("Should allow contributors to save funds", async function () {
      const { piggyBank, contributor1 } = await loadFixture(
        deployPiggyBankFixture
      );
      await piggyBank
        .connect(contributor1)
        .save({ value: hre.ethers.parseEther("1") });
      expect(await piggyBank.contributions(contributor1.address)).to.equal(
        hre.ethers.parseEther("1")
      );
    });

    it("Should prevent saving after withdrawal date", async function () {
      const { piggyBank, contributor1, withdrawalDate } = await loadFixture(
        deployPiggyBankFixture
      );
      await time.increaseTo(withdrawalDate);
      await expect(
        piggyBank
          .connect(contributor1)
          .save({ value: hre.ethers.parseEther("1") })
      ).to.be.revertedWith("YOU CAN NO LONGER SAVE");
    });
  });

  describe("Withdrawals", function () {
    it("Should allow the manager to withdraw if target amount is reached and time has passed", async function () {
      const {
        piggyBank,
        manager,
        contributor1,
        contributor2,
        targetAmount,
        withdrawalDate,
      } = await loadFixture(deployPiggyBankFixture);
      await piggyBank
        .connect(contributor1)
        .save({ value: hre.ethers.parseEther("3") });
      await piggyBank
        .connect(contributor2)
        .save({ value: hre.ethers.parseEther("2") });
      await time.increaseTo(withdrawalDate);
      await expect(
        piggyBank.connect(manager).withdrawal()
      ).to.changeEtherBalances(
        [manager, piggyBank],
        [targetAmount, -targetAmount]
      );
    });

    it("Should prevent withdrawal before the target date", async function () {
      const { piggyBank, manager } = await loadFixture(deployPiggyBankFixture);
      await expect(piggyBank.connect(manager).withdrawal()).to.be.revertedWith(
        "NOT YET TIME"
      );
    });

    it("Should prevent withdrawal if the target amount is not reached", async function () {
      const { piggyBank, manager, withdrawalDate } = await loadFixture(
        deployPiggyBankFixture
      );
      await time.increaseTo(withdrawalDate);
      await expect(piggyBank.connect(manager).withdrawal()).to.be.revertedWith(
        "TARGET AMOUNT NOT REACHED"
      );
    });
  });
});
