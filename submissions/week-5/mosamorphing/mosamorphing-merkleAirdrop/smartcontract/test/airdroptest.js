const { expect } = require("chai");
const { ethers } = require("hardhat");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");

describe("MerkleAirdrop", function () {
  let MerkleAirdrop, airdrop, token, owner, addr1, addr2, addr3;
  let merkleTree, merkleRoot, claims;

  before(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    // Deploy ERC20 Token
    const Token = await ethers.getContractFactory("MyToken");
    token = await Token.deploy(ethers.parseEther("1000"));
    
    // Generate Merkle Tree
    claims = [
      { account: addr1.address, amount: ethers.parseEther("10") },
      { account: addr2.address, amount: ethers.parseEther("20") },
    ];

    const leaves = claims.map(({ account, amount }) => keccak256(ethers.solidityPacked(["address", "uint256"], [account, amount])));
    merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    merkleRoot = merkleTree.getHexRoot();

    // Deploy Airdrop Contract
    MerkleAirdrop = await ethers.getContractFactory("MerkleAirdrop");
    airdrop = await MerkleAirdrop.deploy(token.target, merkleRoot);

    // Transfer tokens to Airdrop Contract
    await token.transfer(airdrop.target, ethers.parseEther("100"));
  });

  it("should allow valid claims", async function () {
    const claim = claims[0];
    const leaf = keccak256(ethers.solidityPacked(["address", "uint256"], [claim.account, claim.amount]));
    const proof = merkleTree.getHexProof(leaf);

    await expect(airdrop.connect(addr1).claim(claim.account, claim.amount, proof))
      .to.emit(token, "Transfer")
      .withArgs(airdrop.target, claim.account, claim.amount);
  });

  it("should prevent duplicate claims", async function () {
    const claim = claims[0];
    const leaf = keccak256(ethers.solidityPacked(["address", "uint256"], [claim.account, claim.amount]));
    const proof = merkleTree.getHexProof(leaf);

    await expect(airdrop.connect(addr1).claim(claim.account, claim.amount, proof))
      .to.be.revertedWith("Already claimed");
  });

  it("should reject invalid claims", async function () {
    const invalidClaim = { account: addr3.address, amount: ethers.parseEther("50") };
    const leaf = keccak256(ethers.solidityPacked(["address", "uint256"], [invalidClaim.account, invalidClaim.amount]));
    const proof = merkleTree.getHexProof(leaf);

    await expect(airdrop.connect(addr3).claim(invalidClaim.account, invalidClaim.amount, proof))
      .to.be.revertedWith("Invalid proof");
  });
});