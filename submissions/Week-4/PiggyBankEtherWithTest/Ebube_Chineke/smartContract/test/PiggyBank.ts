import {
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import hre, { ethers } from "hardhat";
import { expect } from "chai";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { parseEther } from "ethers";

describe("PiggyBank Contract", function () {
    const targetAmount = parseEther("10"); // 10 ETH
      const withdrawalDate = Math.floor(Date.now() / 1000) + 86400; // 1 day in future

      async function deployPiggyBankContract() {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount, manager, user1, user2] = await hre.ethers.getSigners();

        const PiggyBank = await hre.ethers.getContractFactory("PiggyBank");
        const piggyBank = await PiggyBank.deploy(targetAmount,
                  withdrawalDate,
                  manager.address);

        return { piggyBank, owner, otherAccount, manager, user1, user2 };
    }
    
    it("should initialize with correct values", async function () {
        const { piggyBank, manager } = await loadFixture(deployPiggyBankContract);
        expect(await piggyBank.targetAmount()).to.equal(targetAmount);
        expect(await piggyBank.withdrawalDate()).to.equal(withdrawalDate);
        expect(await piggyBank.manager()).to.equal(await manager.getAddress());
      });
    
      it("should allow users to contribute ETH", async function () {
        const { piggyBank, owner, otherAccount, manager, user1, user2 } = await loadFixture(deployPiggyBankContract);
        await expect(piggyBank.connect(user1).save({ value: parseEther("5") })).to.emit(piggyBank, "Contributed")
        .withArgs(user1.address, parseEther("5"), anyValue);
      });
    
      it("should throw error when address zero tries to save", async function () {
        const { piggyBank } = await loadFixture(deployPiggyBankContract);
    
        const zeroAddress = ethers.ZeroAddress;
    
        // Impersonate address(0)
        await ethers.provider.send("hardhat_impersonateAccount", [zeroAddress]);
        // Fund address(0) to allow sending transactions
        await ethers.provider.send("hardhat_setBalance", [zeroAddress, "0x56BC75E2D63100000"]); // 100 ETH
        // Get signer for address(0)
        const zeroSigner = await ethers.getSigner(zeroAddress);
    
        await expect(piggyBank.connect(zeroSigner).save({ value: parseEther("5") }))
            .to.be.revertedWith("UNAUTHORIZED ADDRESS");
    
        // Stop impersonation after test
        await ethers.provider.send("hardhat_stopImpersonatingAccount", [zeroAddress]);
        });
    
        it("should revert if saving is attempted after withdrawal date", async function () {
        const { piggyBank, user1 } = await loadFixture(deployPiggyBankContract);
    
        // Fast forward time past the withdrawal date (e.g., 2 days)
        await ethers.provider.send("evm_increaseTime", [86400 * 365]); // 2 days
        await ethers.provider.send("evm_mine", []); // Mine a new block
    
        // Attempt to save after withdrawal date
        await expect(piggyBank.connect(user1).save({ value: parseEther("5") }))
            .to.be.revertedWith("YOU CAN NO LONGER SAVE");
        });
    
      it("should only allow the manager to withdraw funds", async function () {
        const { piggyBank, owner, otherAccount, manager, user1, user2 } = await loadFixture(deployPiggyBankContract);
    
        const amount = parseEther("10");
    
        await expect(piggyBank.connect(user1).save({ value: parseEther("10") })).to.not.be.reverted;
    
        await ethers.provider.send("evm_increaseTime", [86400*2]); // Fast forward to withdrawal date
        await ethers.provider.send("evm_mine", []);
    
        await expect(piggyBank.connect(user1).withdrawal()).to.be.revertedWith("YOU WAN THIEF ABI ?");
        await expect(piggyBank.connect(manager).withdrawal()).to.emit(piggyBank, "Withdrawn").withArgs(amount, anyValue);
      });
    
      it("should revert withdrawal if target amount is not reached", async function () {
        const { piggyBank, owner, otherAccount, manager, user1, user2 } = await loadFixture(deployPiggyBankContract);
    
        await ethers.provider.send("evm_increaseTime", [86400]); // Fast forward
        await ethers.provider.send("evm_mine", []);
    
        await expect(piggyBank.connect(manager).withdrawal()).to.be.revertedWith("TARGET AMOUNT NOT REACHED");
      });
});