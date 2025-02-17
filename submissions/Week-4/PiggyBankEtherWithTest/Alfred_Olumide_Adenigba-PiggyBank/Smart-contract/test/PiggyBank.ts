import { time, loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { Block } from "ethers";

describe("PiggyBank Contract", () => {
  const deployPiggyBankContract = async () => {

    const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000';
    const [manager, contributor1, contributor2, stranger] = await hre.ethers.getSigners();
    
    const targetAmount = ethers.parseEther("5"); // 5 ETH target
    const withdrawalDate = (await time.latest()) + 86400; // 1 day in the future
    
    const PiggyBank = await hre.ethers.getContractFactory("PiggyBank");
    const deployPiggyBank = await PiggyBank.deploy(targetAmount, withdrawalDate, manager.address);
    
    return { deployPiggyBank, manager, contributor1, contributor2, stranger, targetAmount, withdrawalDate, ADDRESS_ZERO };
  };

  describe("Deployment", () => {
    it("should be deployed by the manager", async () => {
      const { deployPiggyBank, manager } = await loadFixture(deployPiggyBankContract);
      const runner = deployPiggyBank.runner as HardhatEthersSigner;
      expect(runner.address).to.equal(manager.address);
    });

    it("should set the correct target amount and withdrawal date", async () => {
      const { deployPiggyBank, targetAmount, withdrawalDate } = await loadFixture(deployPiggyBankContract);
      expect(await deployPiggyBank.targetAmount()).to.equal(targetAmount);
      expect(await deployPiggyBank.withdrawalDate()).to.equal(withdrawalDate);
    });
  });

  describe("Contributions", () => {
    it("should allow users to contribute funds", async () => {
      const { deployPiggyBank, contributor1 } = await loadFixture(deployPiggyBankContract);
      const amount = ethers.parseEther("1");
      await expect(deployPiggyBank.connect(contributor1).save({ value: amount }))
        .to.emit(deployPiggyBank, "Contributed")
    });

    it("should reject contributions of zero value", async () => {
      const { deployPiggyBank, contributor1 } = await loadFixture(deployPiggyBankContract);
      await expect(deployPiggyBank.connect(contributor1).save({ value: 0 })).to.be.revertedWith("YOU ARE BROKE");
    });
  });

  describe("Withdrawals", () => {
    it("should only allow manager to withdraw after target date is reached", async () => {
      const { deployPiggyBank, manager, contributor1, targetAmount, withdrawalDate } = await loadFixture(deployPiggyBankContract);
      
      await deployPiggyBank.connect(contributor1).save({ value: targetAmount });
      await time.increaseTo(withdrawalDate);
      
      await expect(deployPiggyBank.connect(manager).withdrawal())
        .to.emit(deployPiggyBank, "Withdrawn")
    });

    it("should not allow withdrawal before target date", async () => {
      const { deployPiggyBank, manager } = await loadFixture(deployPiggyBankContract);
      await expect(deployPiggyBank.connect(manager).withdrawal()).to.be.revertedWith("NOT YET TIME");
    });

    it("should not allow withdrawal if target amount is not reached", async () => {
      const { deployPiggyBank, manager, withdrawalDate } = await loadFixture(deployPiggyBankContract);
      await time.increaseTo(withdrawalDate);
      await expect(deployPiggyBank.connect(manager).withdrawal()).to.be.revertedWith("TARGET AMOUNT NOT REACHED");
    });

    it("should prevent non-managers from withdrawing", async () => {
      const { deployPiggyBank, contributor1, withdrawalDate } = await loadFixture(deployPiggyBankContract);
      await time.increaseTo(withdrawalDate);
      await expect(deployPiggyBank.connect(contributor1).withdrawal()).to.be.revertedWith("YOU WAN THIEF ABI ?");
    });
  });
});
