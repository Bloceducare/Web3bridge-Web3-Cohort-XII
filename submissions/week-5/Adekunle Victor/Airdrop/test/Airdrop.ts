// File: test/Airdrop.ts
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
const { AbiCoder } = require("ethers");

describe("Airdrop", function () {
  let airdrop;
  let token;
  let owner;
  let addr1;
  let addr2;
  let addr3;
  let addrs;
  let merkleTree;
  let merkleRoot;

  // Helper function to generate merkle tree and root
  function generateMerkleTree(addresses) {
    const abiCoder = new AbiCoder();
    const leaves = addresses.map(addr => 
      abiCoder.encode(['address'], [addr])
    ).map(keccak256);
    const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    return tree;
  }

  beforeEach(async function () {
    // Get signers
    [owner, addr1, addr2, addr3, ...addrs] = await ethers.getSigners();

    // Deploy token
    const DripToken = await ethers.getContractFactory("DripToken");
    token = await DripToken.deploy().then(contract => contract.waitForDeployment());

    // Generate merkle tree with eligible addresses
    const eligibleAddresses = [addr1.address, addr2.address];
    merkleTree = generateMerkleTree(eligibleAddresses);
    merkleRoot = merkleTree.getRoot();

    // Deploy airdrop contract
    const Airdrop = await ethers.getContractFactory("Airdrop");
    airdrop = await Airdrop.deploy(await token.getAddress(), merkleRoot).then(contract => contract.waitForDeployment());

    // Transfer tokens to airdrop contract
    const transferAmount = ethers.parseEther("1000"); // 1000 tokens
    await token.transfer(await airdrop.getAddress(), transferAmount);
  });

  describe("Deployment", function () {
    it("Should set the correct token address", async function () {
      expect(await airdrop.token()).to.equal(await token.getAddress());
    });

    it("Should set the correct merkle root", async function () {
      expect(await airdrop.merkleRoot()).to.equal(ethers.hexlify(merkleRoot));
    });
  });

  describe("Claiming", function () {
    it("Should allow eligible address to claim tokens", async function () {
      const abiCoder = new AbiCoder();
      const proof = merkleTree.getHexProof(
        keccak256(abiCoder.encode(['address'], [addr1.address]))
      );

      // Check initial balance
      const initialBalance = await token.balanceOf(addr1.address);
      
      // Claim tokens
      await expect(airdrop.connect(addr1).claim(proof))
        .to.emit(airdrop, "Claim")
        .withArgs(addr1.address, ethers.parseEther("100"));

      // Check final balance
      const finalBalance = await token.balanceOf(addr1.address);
      expect(finalBalance - initialBalance).to.equal(ethers.parseEther("100"));
    });

    it("Should prevent double claims", async function () {
      const abiCoder = new AbiCoder();
      const proof = merkleTree.getHexProof(
        keccak256(abiCoder.encode(['address'], [addr1.address]))
      );

      // First claim should succeed
      await airdrop.connect(addr1).claim(proof);

      // Second claim should fail
      await expect(
        airdrop.connect(addr1).claim(proof)
      ).to.be.revertedWith("Airdrop: Already claimed");
    });

    it("Should reject claims with invalid proof", async function () {
      const abiCoder = new AbiCoder();
      // Generate proof for addr1 but try to use it with addr3
      const proof = merkleTree.getHexProof(
        keccak256(abiCoder.encode(['address'], [addr1.address]))
      );

      await expect(
        airdrop.connect(addr3).claim(proof)
      ).to.be.revertedWith("Airdrop: Invalid proof");
    });

    it("Should reject claims from non-eligible addresses", async function () {
      const abiCoder = new AbiCoder();
      // addr3 is not in the merkle tree
      const proof = merkleTree.getHexProof(
        keccak256(abiCoder.encode(['address'], [addr3.address]))
      );

      await expect(
        airdrop.connect(addr3).claim(proof)
      ).to.be.revertedWith("Airdrop: Invalid proof");
    });
  });

  describe("Proof Verification", function () {
    it("Should correctly verify valid proofs", async function () {
      const abiCoder = new AbiCoder();
      const proof = merkleTree.getHexProof(
        keccak256(abiCoder.encode(['address'], [addr1.address]))
      );

      expect(await airdrop.verifyProof(proof, addr1.address)).to.be.true;
    });

    it("Should correctly reject invalid proofs", async function () {
      const abiCoder = new AbiCoder();
      const proof = merkleTree.getHexProof(
        keccak256(abiCoder.encode(['address'], [addr1.address]))
      );

      expect(await airdrop.verifyProof(proof, addr3.address)).to.be.false;
    });
  });

  describe("Edge Cases", function () {
    it("Should handle claims when contract has insufficient balance", async function () {
      const abiCoder = new AbiCoder();
      
      // Drain almost all tokens from the contract, leaving less than claim amount
      const airdropBalance = await token.balanceOf(await airdrop.getAddress());
      const drainAmount = airdropBalance - ethers.parseEther("99"); // Leave less than 100 tokens
      await token.connect(owner).transfer(owner.address, drainAmount);
      
      const proof = merkleTree.getHexProof(
        keccak256(abiCoder.encode(['address'], [addr1.address]))
      );

      await expect(
        airdrop.connect(addr1).claim(proof)
      ).to.be.revertedWith("Airdrop: Transfer failed");
    });

    it("Should handle empty proof array", async function () {
      await expect(
        airdrop.connect(addr1).claim([])
      ).to.be.revertedWith("Airdrop: Invalid proof");
    });
  });
});


