const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MarisolToken", function () {
  let MarisolToken;
  let marisol;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    // Get the ContractFactory and Signers
    MarisolToken = await ethers.getContractFactory("MarisolToken");
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy the contract with an initial supply of 1000 tokens
    marisol = await MarisolToken.deploy(1000);
    await marisol.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await marisol.balanceOf(owner.address);
      expect(await marisol.totalSupply()).to.equal(ownerBalance);
    });

    it("Should set the correct token name and symbol", async function () {
      expect(await marisol.name()).to.equal("Marisol");
      expect(await marisol.symbol()).to.equal("MAR");
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      // Transfer 50 tokens from owner to addr1
      await marisol.transfer(addr1.address, 50);
      const addr1Balance = await marisol.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(50);

      // Transfer 50 tokens from addr1 to addr2
      await marisol.connect(addr1).transfer(addr2.address, 50);
      const addr2Balance = await marisol.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });

    it("Should fail if sender doesn’t have enough tokens", async function () {
      const initialOwnerBalance = await marisol.balanceOf(owner.address);

      // Try to send 1 token from addr1 (0 tokens) to owner (should fail)
      await expect(
        marisol.connect(addr1).transfer(owner.address, 1)
      ).to.be.revertedWith("Insufficient balance");

      expect(await marisol.balanceOf(owner.address)).to.equal(initialOwnerBalance);
    });

    it("Should update balances after transfers", async function () {
        const initialOwnerBalance = await marisol.balanceOf(owner.address);
      
        // Transfer 100 tokens to addr1
        await marisol.transfer(addr1.address, 100);
      
        // Transfer 50 tokens to addr2
        await marisol.transfer(addr2.address, 50);
      
        // Check balances
        const finalOwnerBalance = await marisol.balanceOf(owner.address);
        expect(finalOwnerBalance).to.equal(initialOwnerBalance - BigInt(150)); // Converts 150 to BigInt
      
        const addr1Balance = await marisol.balanceOf(addr1.address);
        expect(addr1Balance).to.equal(100);
      
        const addr2Balance = await marisol.balanceOf(addr2.address);
        expect(addr2Balance).to.equal(50);
      });
  });

  describe("Approvals", function () {
    it("Should allow an account to approve another to spend tokens", async function () {
      // Approve addr1 to spend 100 tokens on behalf of owner
      await marisol.approve(addr1.address, 100);
      expect(await marisol.allowance(owner.address, addr1.address)).to.equal(100);
    });

    it("Should allow an approved account to transfer tokens", async function () {
      // Approve addr1 to spend 100 tokens on behalf of owner
      await marisol.approve(addr1.address, 100);

      // Transfer 50 tokens from owner to addr2 using addr1
      await marisol.connect(addr1).transferFrom(owner.address, addr2.address, 50);

      // Check balances and allowance
      expect(await marisol.balanceOf(addr2.address)).to.equal(50);
      expect(await marisol.allowance(owner.address, addr1.address)).to.equal(50);
    });

    it("Should fail if transferFrom exceeds allowance", async function () {
      // Approve addr1 to spend 100 tokens on behalf of owner
      await marisol.approve(addr1.address, 100);

      // Try to transfer 150 tokens (more than allowance)
      await expect(
        marisol.connect(addr1).transferFrom(owner.address, addr2.address, 150)
      ).to.be.revertedWith("Allowance exceeded");
    });
  });
});