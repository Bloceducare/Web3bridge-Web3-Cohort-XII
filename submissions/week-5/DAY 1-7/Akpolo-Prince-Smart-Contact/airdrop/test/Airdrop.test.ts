import { time, loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";
// import { utils } from "ethers";

describe("AkpoloAirdrop", function () {
  // This fixture deploys the token and airdrop contracts and sets up the Merkle tree.
  async function deployFixture() {
    const [owner, user1, user2, ...addrs] = await ethers.getSigners();

    // Deploy MyToken contract with an initial supply
    const initialSupply = ethers.parseEther("10000");
    const TokenFactory = await ethers.getContractFactory("MyToken");
    const token = await TokenFactory.deploy(initialSupply);
    // await token.deployed();
// 
    // Build a Merkle tree with user1 and user2 as eligible addresses.
    // The contract uses keccak256(abi.encodePacked(address)) to create leaves.
    const leaves = [user1.address, user2.address].map((addr) =>
      ethers.keccak256(ethers.solidityPacked(["address"], [addr]))
    );
    const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    const merkleRoot = merkleTree.getHexRoot();

    // Set the drop amount to 100 tokens
    const dropAmount = ethers.parseEther("100");

    // Deploy the Airdrop contract with the token address, drop amount, and Merkle root
    const AirdropFactory = await ethers.getContractFactory("AkpoloAirdrop");
    const airdrop = await AirdropFactory.deploy(token.target, dropAmount, merkleRoot);
    // await airdrop.deployed();

    // Transfer tokens to the airdrop contract so that it has funds for distribution.
    await token.transfer(airdrop.target, ethers.parseEther("1000"));

    return { token, airdrop, owner, user1, user2, merkleTree, merkleRoot, dropAmount };
  }

  describe("Airdrop Claim", function () {
    it("allows an eligible user to claim the airdrop", async function () {
      const { airdrop, token, user1, merkleTree, dropAmount } = await loadFixture(deployFixture);

      // Generate the Merkle proof for user1
      const leaf = ethers.keccak256(ethers.solidityPacked(["address"], [user1.address]));
      const proof = merkleTree.getHexProof(leaf);

      // User1 claims the airdrop. The TransferDrop event should be emitted.
      await expect(airdrop.connect(user1).getDrop(proof))
        .to.emit(airdrop, "TransferDrop")
        .withArgs(user1.address, dropAmount);

      // Verify that user1’s token balance increased by dropAmount.
      const balance = await token.balanceOf(user1.address);
      expect(balance).to.equal(dropAmount);

      // Verify that claim status is updated.
      expect(await airdrop.hasClaimed(user1.address)).to.equal(true);
    });

    it("prevents an ineligible user from claiming", async function () {
      const { airdrop, owner, merkleTree } = await loadFixture(deployFixture);

      // Owner is not part of the Merkle tree.
      const leaf = ethers.keccak256(ethers.solidityPacked(["address"], [owner.address]));
      const proof = merkleTree.getHexProof(leaf);

      await expect(airdrop.connect(owner).getDrop(proof))
        .to.be.revertedWith("Invalid Merkle Proof");
    });

    it("prevents a user from claiming twice", async function () {
      const { airdrop, user1, merkleTree } = await loadFixture(deployFixture);

      const leaf = ethers.keccak256(ethers.solidityPacked(["address"], [user1.address]));
      const proof = merkleTree.getHexProof(leaf);

      // First claim should succeed.
      await airdrop.connect(user1).getDrop(proof);

      // A second claim should be rejected.
      await expect(airdrop.connect(user1).getDrop(proof))
        .to.be.revertedWith("Already claimed airdrop");
    });
  });

  describe("Owner Functions", function () {
    it("allows the owner to withdraw remaining tokens", async function () {
      const { airdrop, token, owner, user1, merkleTree } = await loadFixture(deployFixture);

      // Let user1 claim first.
      const leaf = ethers.keccak256(ethers.solidityPacked(["address"], [user1.address]));
      const proof = merkleTree.getHexProof(leaf);
      await airdrop.connect(user1).getDrop(proof);

      // Get the current contract token balance.
      const contractBalance = await token.balanceOf(airdrop.target);

      // Owner withdraws the remaining tokens.
      await expect(airdrop.connect(owner).withdraw())
        .to.emit(airdrop, "Withdraw")
        .withArgs(owner.address, contractBalance);

      // Verify that the contract balance is now zero.
      expect(await token.balanceOf(airdrop.target)).to.equal(0);
    });

    it("allows the owner to change the drop amount", async function () {
      const { airdrop, owner } = await loadFixture(deployFixture);

      const newAmount = ethers.parseEther("200");
      await airdrop.connect(owner).changeDropAmount(newAmount);
      expect(await airdrop.dropAmount()).to.equal(newAmount);
    });

    it("allows the owner to reset a user's claim status", async function () {
      const { airdrop, user1, owner, merkleTree } = await loadFixture(deployFixture);

      const leaf = ethers.keccak256(ethers.solidityPacked(["address"], [user1.address]));
      const proof = merkleTree.getHexProof(leaf);
      await airdrop.connect(user1).getDrop(proof);
      expect(await airdrop.hasClaimed(user1.address)).to.equal(true);

      // Owner resets the claim status.
      await airdrop.connect(owner).resetClaimStatus(user1.address);
      expect(await airdrop.hasClaimed(user1.address)).to.equal(false);
    });

    it("allows the owner to change the token address", async function () {
      const { airdrop, owner } = await loadFixture(deployFixture);

      // Deploy a new token contract.
      const newInitialSupply = ethers.parseEther("5000");
      const TokenFactory = await ethers.getContractFactory("MyToken");
      const newToken = await TokenFactory.deploy(newInitialSupply);
      // await newToken.deployed();

      // Owner changes the token address.
      await airdrop.connect(owner).newToken(newToken.target);
      expect(await airdrop.token()).to.equal(newToken.target);
    });

    it("allows the owner to change the Merkle root", async function () {
      const { airdrop, owner, user1 } = await loadFixture(deployFixture);

      // Create a new Merkle tree with only user1 eligible.
      const newLeaf = ethers.keccak256(ethers.solidityPacked(["address"], [user1.address]));
      const newMerkleTree = new MerkleTree([newLeaf], keccak256, { sortPairs: true });
      const newMerkleRoot = newMerkleTree.getHexRoot();

      // Owner updates the Merkle root.
      await airdrop.connect(owner).changeMerkleRoot(newMerkleRoot);
      expect(await airdrop.merkleRoot()).to.equal(newMerkleRoot);
    });
  });
});
