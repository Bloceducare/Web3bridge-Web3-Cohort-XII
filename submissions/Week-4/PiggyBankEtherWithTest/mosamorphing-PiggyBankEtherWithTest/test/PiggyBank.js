const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ValSafeLock", function () {
  let ValSafeLock;
  let valSafeLock;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    // Get the ContractFactory and Signers
    ValSafeLock = await ethers.getContractFactory("ValSafeLock");
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy the contract
    valSafeLock = await ValSafeLock.deploy();
    await valSafeLock.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await valSafeLock.owner()).to.equal(owner.address);
    });

    it("Should set the correct unlock time (Valentine's Day)", async function () {
      const currentTime = Math.floor(Date.now() / 1000); // Current timestamp in seconds
      const unlockTime = await valSafeLock.unlockTime();

      // Check if the unlock time is within the expected range (Feb 14 of the current year)
      const year = 1970 + Math.floor(currentTime / 31556926); // Approximate year
      const expectedUnlockTime = (year - 1970) * 31556926 + 44 * 86400; // Feb 14 timestamp
      expect(unlockTime).to.equal(BigInt(expectedUnlockTime));
    });
  });

  describe("Deposit", function () {
    it("Should allow users to deposit Ether", async function () {
      const depositAmount = ethers.parseEther("1.0"); // 1 Ether

      // Deposit Ether from addr1
      await expect(
        valSafeLock.connect(addr1).deposit({ value: depositAmount })
      )
        .to.emit(valSafeLock, "DepositSuccessful")
        .withArgs(addr1.address, depositAmount);

      // Check the contract balance
      const contractBalance = await valSafeLock.getBalance();
      expect(contractBalance).to.equal(depositAmount);
    });

    it("Should fail if no Ether is sent", async function () {
      // Attempt to deposit 0 Ether
      await expect(
        valSafeLock.connect(addr1).deposit({ value: 0 })
      ).to.be.revertedWith("Must deposit some Ether");
    });
  });

  describe("Withdraw", function () {
    it("Should fail if withdrawal is attempted before Valentine's Day", async function () {
      const depositAmount = ethers.parseEther("1.0");
  
      // Deposit Ether from addr1
      await valSafeLock.connect(addr1).deposit({ value: depositAmount });
  
      // Attempt to withdraw *before* Valentine's Day
      await expect(valSafeLock.connect(owner).withdraw())
        .to.be.revertedWith("Can only withdraw on Valentine's Day");
    });
  
    it("Should fail if no balance is available to withdraw", async function () {
      const unlockTime = await valSafeLock.unlockTime();
      await ethers.provider.send("evm_setNextBlockTimestamp", [
        Number(unlockTime) + 1, 
      ]);
      await ethers.provider.send("evm_mine");
  
      // Try withdrawing without deposits
      await expect(valSafeLock.connect(owner).withdraw())
        .to.be.revertedWith("No balance to withdraw");
    });
  });
  

  describe("getBalance", function () {
    it("Should return the correct contract balance", async function () {
      const depositAmount = ethers.parseEther("1.0"); // 1 Ether

      // Deposit Ether from addr1
      await valSafeLock.connect(addr1).deposit({ value: depositAmount });

      // Check the contract balance
      const contractBalance = await valSafeLock.getBalance();
      expect(contractBalance).to.equal(depositAmount);
    });
  });
});