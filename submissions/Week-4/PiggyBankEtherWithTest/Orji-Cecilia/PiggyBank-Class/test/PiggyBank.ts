import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("PiggyBank-Contract-Tests", function () {
  async function deployPiggyBank() {
    const [manager, address1, address2] = await hre.ethers.getSigners();

    const targetAmount = hre.ethers.parseEther("1"); 
    const withdrawalDate = Math.floor(Date.now() / 1000) + 604800; 

    // Deploy the PiggyBank contract
    const PiggyBank = await hre.ethers.getContractFactory("PiggyBank");
    const piggyBank = await PiggyBank.deploy(targetAmount, withdrawalDate, manager.address);

    return { manager, address1, address2, piggyBank, targetAmount, withdrawalDate };
  }

  describe("Deployment", function () {
    it("Should be deployed by the manager", async function () {
      const { manager, piggyBank } = await loadFixture(deployPiggyBank);
      expect(await piggyBank.manager()).to.equal(manager.address);
    });

    it("Should set the correct target amount", async function () {
      const { piggyBank, targetAmount } = await loadFixture(deployPiggyBank);
      expect(await piggyBank.targetAmount()).to.equal(targetAmount);
    });

    it("Should set a valid withdrawal date", async function () {
      const { piggyBank, withdrawalDate } = await loadFixture(deployPiggyBank);
      expect(await piggyBank.withdrawalDate()).to.equal(withdrawalDate);
    });
  });

  describe("Deposits", function () {
    it("Should allow users to deposit funds", async function () {
      const { address1, piggyBank } = await loadFixture(deployPiggyBank);
      const depositAmount = hre.ethers.parseEther("0.5"); 

      await piggyBank.connect(address1).save({ value: depositAmount });

      expect(await piggyBank.contributions(address1.address)).to.equal(depositAmount);
    });

    it("Should reject deposits of 0 ETH", async function () {
      const { address1, piggyBank } = await loadFixture(deployPiggyBank);

      await expect(piggyBank.connect(address1).save({ value: 0 })).to.be.revertedWith("YOU ARE BROKE");
    });

    it("Should reject deposits after withdrawal time", async function () {
      const { address1, piggyBank } = await loadFixture(deployPiggyBank);
    
      // Increase time to after withdrawal date
      await hre.network.provider.send("evm_increaseTime", [604800]); // 7 days
      await hre.network.provider.send("evm_mine"); // ✅ Mine a new block
    
      // Expect deposit to fail
      await expect(piggyBank.connect(address1).save({ value: hre.ethers.parseEther("0.5") }))
        .to.be.revertedWith("YOU CAN NO LONGER SAVE");
    });    
  });

  describe("Withdrawals", function () {
    it("Should prevent withdrawals before the unlock time", async function () {
      const { manager, piggyBank } = await loadFixture(deployPiggyBank);

      await expect(piggyBank.connect(manager).withdrawal()).to.be.revertedWith("NOT YET TIME");
    });

    it("Should allow the manager to withdraw after the unlock time", async function () {
      const { manager, address1, piggyBank, targetAmount } = await loadFixture(deployPiggyBank);
      
      // Deposit funds
      await piggyBank.connect(address1).save({ value: targetAmount });
    
      // Increase time to after withdrawal date
      await hre.network.provider.send("evm_increaseTime", [604800]);  
      await hre.network.provider.send("evm_mine"); 
    
      // Expect withdrawal to succeed
      await expect(() => piggyBank.connect(manager).withdrawal()).to.changeEtherBalance(manager, targetAmount);
    });
    
    it("Should reject withdrawals if the target amount is not met", async function () {
      const { manager, address1, piggyBank } = await loadFixture(deployPiggyBank);
    
      // Deposit only 0.5 ETH instead of 1 ETH
      await piggyBank.connect(address1).save({ value: hre.ethers.parseEther("0.5") });
    
      // Increase time to after withdrawal date
      await hre.network.provider.send("evm_increaseTime", [604800]); 
      await hre.network.provider.send("evm_mine"); 
    
      // Expect withdrawal to fail due to insufficient funds
      await expect(piggyBank.connect(manager).withdrawal()).to.be.revertedWith("TARGET AMOUNT NOT REACHED");
    });   

    it("Should reject withdrawals from non-managers", async function () {
      const { address1, piggyBank } = await loadFixture(deployPiggyBank);

      await expect(piggyBank.connect(address1).withdrawal()).to.be.revertedWith("YOU WAN THIEF ABI ?");
    });
  });
});
