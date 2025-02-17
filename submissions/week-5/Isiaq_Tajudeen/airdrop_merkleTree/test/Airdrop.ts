import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { parseUnits } from "ethers";

describe("Airdrop", () => {
  // Helper function to create merkle tree from user data
  const createMerkleTreeFromUserData = (userData: any) => {
    const leaves = userData.map((data: any) =>
      ethers.solidityPackedKeccak256(
        ["address", "uint256"],
        [data.address, data.amount]
      )
    );

    return new MerkleTree(leaves, keccak256, { sortPairs: true });
  };

  const deployAirdropContract = async () => {
    const [owner, account2, account3, account4, account5] =
      await ethers.getSigners();

    // Deploy ERC20 token
    const TestToken = await ethers.getContractFactory("USDB");
    const token = await TestToken.deploy();
    const tokenAddress = await token.getAddress();

    // Create initial merkle tree with user data
    const userData = [
      { address: account2.address, amount: parseUnits("100", 18) },
      { address: account3.address, amount: parseUnits("2000", 18) },
      { address: account4.address, amount: parseUnits("300", 18) },
    ];

    const merkleTree = createMerkleTreeFromUserData(userData);
    const rootHash = merkleTree.getRoot();
    const merkleRootHashToString = "0x" + rootHash.toString("hex");

    // Airdrop timing
    const startTime = (await time.latest()) + 60; // Starts in 1 minute
    const endTime = startTime + 86400; // End in 24 hrs

    const Airdrop = await ethers.getContractFactory("Airdrop");
    const airdrop = await Airdrop.deploy(
      merkleRootHashToString,
      tokenAddress,
      startTime,
      endTime
    );

    // Transfer tokens to airdrop contract
    const totalAirdropAmount = ethers.parseUnits("900000", 18);
    await token.mint(await airdrop.getAddress(), totalAirdropAmount);

    return {
      airdrop,
      token,
      owner,
      account2,
      account3,
      account4,
      account5,
      merkleTree,
      userData,
      startTime,
      endTime,
    };
  };

  describe("Deployment", () => {
    it("Should set the correct initial state", async () => {
      const { airdrop, token, owner, startTime, endTime } = await loadFixture(
        deployAirdropContract
      );

      expect(await airdrop.owner()).to.equal(owner.address);
      expect(await airdrop.tokenAddress()).to.equal(await token.getAddress());
      expect(await airdrop.airdropStartTime()).to.equal(startTime);
      expect(await airdrop.airdropEndTime()).to.equal(endTime);
      expect(await airdrop.isPaused()).to.be.false;
    });

    it("Should reject zero address token", async () => {
      const Airdrop = await ethers.getContractFactory("Airdrop");
      const startTime = (await time.latest()) + 60;
      const endTime = startTime + 86400;

      await expect(
        Airdrop.deploy(ethers.ZeroHash, ethers.ZeroAddress, startTime, endTime)
      ).to.be.revertedWithCustomError(Airdrop, "AddressZeroDetected");
    });
  });

  describe("Airdrop Claims", () => {
    it("Should allow eligible user to claim tokens", async () => {
      const { airdrop, token, account2, merkleTree, userData, startTime } =
        await loadFixture(deployAirdropContract);

      // Fast forward to start time
      await time.increaseTo(startTime + 1);

      const userIndex = 0; // account2's data
      const leaf = ethers.solidityPackedKeccak256(
        ["address", "uint256"],
        [userData[userIndex].address, userData[userIndex].amount]
      );
      const proof = merkleTree.getProof(leaf);
      const proofHex = proof.map((p) => "0x" + p.data.toString("hex"));

      await expect(
        airdrop
          .connect(account2)
          .claimAirdrop(userData[userIndex].amount, proofHex)
      )
        .to.emit(airdrop, "AirdropClaimed")
        .withArgs(
          account2.address,
          userData[userIndex].amount,
          (await time.latest()) + 1
        );

      expect(await token.balanceOf(account2.address)).to.equal(
        userData[userIndex].amount
      );
    });

    it("Should prevent double claims", async () => {
      const { airdrop, account2, merkleTree, userData, startTime } =
        await loadFixture(deployAirdropContract);

      await time.increaseTo(startTime + 1);

      const userIndex = 0;
      const leaf = ethers.solidityPackedKeccak256(
        ["address", "uint256"],
        [userData[userIndex].address, userData[userIndex].amount]
      );
      const proof = merkleTree.getProof(leaf);
      const proofHex = proof.map((p) => "0x" + p.data.toString("hex"));

      await airdrop
        .connect(account2)
        .claimAirdrop(userData[userIndex].amount, proofHex);

      await expect(
        airdrop
          .connect(account2)
          .claimAirdrop(userData[userIndex].amount, proofHex)
      ).to.be.revertedWithCustomError(airdrop, "HasAlreadyClaimedAirdrop");
    });
  });

  describe("Time Control Flows", () => {
    it("Should prevent claims before start time", async () => {
      const { airdrop, account2, merkleTree, userData } = await loadFixture(
        deployAirdropContract
      );

      const userIndex = 0;
      const leaf = ethers.solidityPackedKeccak256(
        ["address", "uint256"],
        [userData[userIndex].address, userData[userIndex].amount]
      );
      const proof = merkleTree.getProof(leaf);
      const proofHex = proof.map((p) => "0x" + p.data.toString("hex"));

      await expect(
        airdrop
          .connect(account2)
          .claimAirdrop(userData[userIndex].amount, proofHex)
      ).to.be.revertedWithCustomError(airdrop, "AirdropNotActive");
    });

    it("Should allow owner to postpone the start time & end time range", async () => {
      const { airdrop, startTime, endTime } = await loadFixture(
        deployAirdropContract
      );

      const newStartTime = startTime + 3600; // Add 1 hour
      const newEndTime = endTime + 3600;

      await expect(airdrop.setAirdropTiming(newStartTime, newEndTime))
        .to.emit(airdrop, "AirdropTimeUpdated")
        .withArgs(newStartTime, newEndTime);

      expect(await airdrop.airdropStartTime()).to.equal(newStartTime);
      expect(await airdrop.airdropEndTime()).to.equal(newEndTime);
    });
  });

  describe("Owner's Controls", () => {
    it("Should allow owner to pause and unpause", async () => {
      const { airdrop } = await loadFixture(deployAirdropContract);

      await expect(airdrop.togglePause())
        .to.emit(airdrop, "AirdropPaused")
        .withArgs(true);

      expect(await airdrop.isPaused()).to.be.true;

      await expect(airdrop.togglePause())
        .to.emit(airdrop, "AirdropPaused")
        .withArgs(false);

      expect(await airdrop.isPaused()).to.be.false;
    });

    it("Should allow owner to withdraw remaining tokens", async () => {
      const { airdrop, token, owner, endTime } = await loadFixture(
        deployAirdropContract
      );

      // Fast forward past end time
      await time.increaseTo(endTime + 1);

      const balance = await token.balanceOf(await airdrop.getAddress());
      await expect(airdrop.withdrawRemainingTokens())
        .to.emit(airdrop, "AirdropRemBalWithdrawn")
        .withArgs(balance, "Withdrawal successful");

      expect(
        (await token.balanceOf(owner.address)) - parseUnits("100000", 18)
      ).to.equal(balance);
    });

    it("Should prevent non-owner from administrative actions", async () => {
      const { airdrop, account2 } = await loadFixture(deployAirdropContract);

      await expect(
        airdrop.connect(account2).togglePause()
      ).to.be.revertedWithCustomError(airdrop, "NotOwner");

      await expect(
        airdrop.connect(account2).withdrawRemainingTokens()
      ).to.be.revertedWithCustomError(airdrop, "NotOwner");
    });
  });
});
