import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import hre from "hardhat";
import { expect } from "chai";
import { ethers } from "ethers";

describe('PiggyVest test', () => {
  
  const deployPiggyBankContract = async () => {
      const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'

      const [manager, account1, account2, account3] = await hre.ethers.getSigners();

      const PiggyBank = await hre.ethers.getContractFactory("PiggyBank");

      // Set unlock time to 1 minute in the future for testing
      const oneMinuteFromNow = Math.floor(Date.now() / 1000) + 60;
      const piggyBank = await PiggyBank.deploy(oneMinuteFromNow);

      return { piggyBank, manager, account1, ADDRESS_ZERO, oneMinuteFromNow }
  };

  describe("Deployment", () => {

      it('should be deployed by manager', async() => {
          let { piggyBank, manager } = await loadFixture(deployPiggyBankContract);

          const runner = piggyBank.runner as HardhatEthersSigner;

          expect(runner.address).to.equal(manager.address);
      });

      it('should not be address zero', async() => {
          let { piggyBank, ADDRESS_ZERO } = await loadFixture(deployPiggyBankContract);

          expect(piggyBank.target).to.not.be.equal(ADDRESS_ZERO);
      }); 

      it('should set the correct unlock time', async () => {
          let { piggyBank, oneMinuteFromNow } = await loadFixture(deployPiggyBankContract);

          const unlockTime = await piggyBank.unlockTime();
          expect(unlockTime).to.equal(oneMinuteFromNow);
      });
  });

  describe('Deposit', () => {

      it('should deposit Ether into the piggy bank', async () => {
          let { piggyBank, manager } = await loadFixture(deployPiggyBankContract);

          const initialBalance = await piggyBank.balance();
          
          const depositAmount = hre.ethers.parseEther("1.0");

          await piggyBank.deposit({ value: depositAmount });

          const newBalance = await piggyBank.balance();

          expect(newBalance).to.be.greaterThan(initialBalance);
          expect(newBalance).to.equal(BigInt(initialBalance) + BigInt(depositAmount));
      });
  });

  describe('Withdraw', () => {

      it('should withdraw Ether from the piggy bank', async () => {
          let { piggyBank, manager, oneMinuteFromNow } = await loadFixture(deployPiggyBankContract);

          const depositAmount = hre.ethers.parseEther("1.0");
          await piggyBank.deposit({ value: depositAmount });

          await hre.network.provider.send("evm_increaseTime", [60]); 
          await hre.network.provider.send("evm_mine"); 

          const initialBalance = await piggyBank.balance();
          const withdrawAmount = hre.ethers.parseEther("0.5");

          await piggyBank.withdraw(withdrawAmount);

          const newBalance = await piggyBank.balance();

          expect(newBalance).to.be.lessThan(initialBalance);
          expect(newBalance).to.equal(BigInt(initialBalance) - BigInt(withdrawAmount));
      });

      it('should revert if attempting to withdraw before unlock time', async () => {
          let { piggyBank, manager } = await loadFixture(deployPiggyBankContract);

          const depositAmount = hre.ethers.parseEther("1.0");
          await piggyBank.deposit({ value: depositAmount });

          await expect(piggyBank.withdraw(hre.ethers.parseEther("0.1"))).to.be.revertedWith("Savings still locked");
      });

      it('should revert if non-manager tries to withdraw', async () => {
          let { piggyBank, account1 } = await loadFixture(deployPiggyBankContract);

          const depositAmount = hre.ethers.parseEther("1.0");
          await piggyBank.deposit({ value: depositAmount });

          await expect(piggyBank.connect(account1).withdraw(hre.ethers.parseEther("0.1"))).to.be.revertedWith("Only the manager can withdraw funds");
      });

      it('should revert if withdraw amount exceeds balance', async () => {
          let { piggyBank, manager, oneMinuteFromNow } = await loadFixture(deployPiggyBankContract);

          const depositAmount = hre.ethers.parseEther("1.0");
          await piggyBank.deposit({ value: depositAmount });

          
          await hre.network.provider.send("evm_increaseTime", [65]); 
          await hre.network.provider.send("evm_mine"); 
          await expect(piggyBank.withdraw(hre.ethers.parseEther("2.0"))).to.be.revertedWith("Insufficient balance");
      });
  });

  describe('Get Balance', () => {

      it('should return correct balance', async () => {
          let { piggyBank } = await loadFixture(deployPiggyBankContract);

          const depositAmount = hre.ethers.parseEther("1.0");
          await piggyBank.deposit({ value: depositAmount });

          const balance = await piggyBank.getBalance();

          expect(balance).to.equal(BigInt(depositAmount));
      });
  });
});
