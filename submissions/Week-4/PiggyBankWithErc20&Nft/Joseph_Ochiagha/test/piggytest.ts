import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("OurPiggyBank", function () {
  async function deployPiggyBankFixture() {
    const [owner, manager, user1, user2] = await ethers.getSigners();

    // Deploy ERC20 token (using the provided ERC20 contract)
    const Token = await ethers.getContractFactory("ERC20");
    const token = await Token.deploy("CXII Token", "CXII", 1000000); // 1M tokens initial supply

    const currentTime = await time.latest();
    const withdrawalDate = currentTime + 7 * 24 * 60 * 60; // 7 days from now
    const targetAmount = ethers.parseEther("100");

    const PiggyBank = await ethers.getContractFactory("OurPiggyBank");
    const piggyBank = await PiggyBank.deploy(
      targetAmount,
      withdrawalDate,
      manager.address,
      await token.getAddress()
    );

    return {
      piggyBank,
      token,
      owner,
      manager,
      user1,
      user2,
      targetAmount,
      withdrawalDate,
    };
  }

  describe("Deployment", function () {
    it("Should set the correct target amount", async function () {
      const { piggyBank, targetAmount } = await loadFixture(
        deployPiggyBankFixture
      );
      expect(await piggyBank.targetAmount()).to.equal(targetAmount);
    });

    it("Should set the correct withdrawal date", async function () {
      const { piggyBank, withdrawalDate } = await loadFixture(
        deployPiggyBankFixture
      );
      expect(await piggyBank.withdrawalDate()).to.equal(withdrawalDate);
    });

    it("Should set the correct manager", async function () {
      const { piggyBank, manager } = await loadFixture(deployPiggyBankFixture);
      expect(await piggyBank.manager()).to.equal(manager.address);
    });
  });

  describe("Saving", function () {
    it("Should allow users to save tokens", async function () {
      const { piggyBank, token, owner, user1 } = await loadFixture(
        deployPiggyBankFixture
      );
      const saveAmount = ethers.parseEther("10");

      // Transfer tokens to user1 from owner
      await token.transfer(user1.address, saveAmount);

      // Approve piggyBank to spend tokens
      await token
        .connect(user1)
        .approve(await piggyBank.getAddress(), saveAmount);

      // Save tokens
      const tx = await piggyBank.connect(user1).save(saveAmount);
      const receipt = await tx.wait();

      // Get the event from the transaction receipt
      const event = receipt?.logs[1]; // The Contributed event
      const decodedEvent = piggyBank.interface.parseLog({
        topics: event?.topics as string[],
        data: event?.data as string,
      });

      // Verify event data
      expect(decodedEvent?.args.Contributor).to.equal(user1.address);
      expect(decodedEvent?.args.amount).to.equal(saveAmount);
      expect(decodedEvent?.args.time).to.be.closeTo(
        await time.latest(),
        5 // Allow for 5 seconds difference
      );

      expect(await piggyBank.contributions(user1.address)).to.equal(saveAmount);
    });

    it("Should increment contributors count for first-time savers", async function () {
      const { piggyBank, token, owner, user1 } = await loadFixture(
        deployPiggyBankFixture
      );
      const saveAmount = ethers.parseEther("10");

      await token.transfer(user1.address, saveAmount);
      await token
        .connect(user1)
        .approve(await piggyBank.getAddress(), saveAmount);

      expect(await piggyBank.contributorsCount()).to.equal(0);
      await piggyBank.connect(user1).save(saveAmount);
      expect(await piggyBank.contributorsCount()).to.equal(1);
    });

    it("Should not allow saving after withdrawal date", async function () {
      const { piggyBank, token, owner, user1, withdrawalDate } =
        await loadFixture(deployPiggyBankFixture);
      const saveAmount = ethers.parseEther("10");

      await token.transfer(user1.address, saveAmount);
      await token
        .connect(user1)
        .approve(await piggyBank.getAddress(), saveAmount);

      // Move time past withdrawal date
      await time.increaseTo(withdrawalDate + 1);

      await expect(
        piggyBank.connect(user1).save(saveAmount)
      ).to.be.revertedWith("YOU CAN NO LONGER SAVE");
    });
  });

  describe("Withdrawal", function () {
    it("Should allow manager to withdraw after withdrawal date when target is met", async function () {
      const {
        piggyBank,
        token,
        owner,
        manager,
        user1,
        targetAmount,
        withdrawalDate,
      } = await loadFixture(deployPiggyBankFixture);

      // Transfer and save enough to meet target
      await token.transfer(user1.address, targetAmount);
      await token
        .connect(user1)
        .approve(await piggyBank.getAddress(), targetAmount);
      await piggyBank.connect(user1).save(targetAmount);

      // Move time past withdrawal date
      await time.increaseTo(withdrawalDate + 1);

      const tx = await piggyBank.connect(manager).withdrawal();
      const receipt = await tx.wait();

      // Get the event from the transaction receipt
      const event = receipt?.logs[1]; // The Withdrawn event
      const decodedEvent = piggyBank.interface.parseLog({
        topics: event?.topics as string[],
        data: event?.data as string,
      });

      // Verify event data
      expect(decodedEvent?.args.amount).to.equal(targetAmount);
      expect(decodedEvent?.args.time).to.be.closeTo(
        await time.latest(),
        5 // Allow for 5 seconds difference
      );

      expect(await token.balanceOf(manager.address)).to.equal(targetAmount);
    });

    it("Should not allow non-manager to withdraw", async function () {
      const { piggyBank, user1 } = await loadFixture(deployPiggyBankFixture);

      await expect(piggyBank.connect(user1).withdrawal()).to.be.revertedWith(
        "YOU WAN THIEF ABI ?"
      );
    });

    it("Should not allow withdrawal before withdrawal date", async function () {
      const { piggyBank, manager } = await loadFixture(deployPiggyBankFixture);

      await expect(piggyBank.connect(manager).withdrawal()).to.be.revertedWith(
        "NOT YET TIME"
      );
    });
  });
});
