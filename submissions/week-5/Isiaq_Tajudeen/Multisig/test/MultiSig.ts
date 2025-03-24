import { expect } from "chai";
import hre from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("MultiSig Contract Tests", function () {
  async function deployMultiSigFixture() {
    const [owner, signer1, signer2, receiver, newOwner] =
      await hre.ethers.getSigners();
    const MultiSig = await hre.ethers.getContractFactory("MultiSig");

    const validSigners = [signer1.address, signer2.address];
    const quorum = 2;
    const multiSig = await MultiSig.deploy(validSigners, quorum, {
      value: hre.ethers.parseEther("10"),
    });

    return { multiSig, owner, signer1, signer2, receiver, newOwner };
  }

  describe("Deployment", function () {
    it("Should deploy with the correct owner, signers, and quorum", async function () {
      const { multiSig, signer1, signer2 } = await loadFixture(
        deployMultiSigFixture
      );

      expect(await multiSig.signers(0)).to.equal(signer1.address);
      expect(await multiSig.signers(1)).to.equal(signer2.address);
    });
  });

  describe("Transaction Creation and Signing", function () {
    it("Should allow a valid signer to create a transaction", async function () {
      const { multiSig, signer1, receiver } = await loadFixture(
        deployMultiSigFixture
      );

      await multiSig
        .connect(signer1)
        .initiateTransaction(hre.ethers.parseEther("1"), receiver.address);

      const allTransactions = await multiSig.getAllTransactions();
      expect(allTransactions[0].amount).to.equal(hre.ethers.parseEther("1"));
      expect(allTransactions[0].receiver).to.equal(receiver.address);
      expect(allTransactions[0].signersCount).to.equal(1);
    });

    it("Should allow multiple signers to sign and execute a transaction", async function () {
      const { multiSig, signer1, signer2, receiver } = await loadFixture(
        deployMultiSigFixture
      );

      await multiSig
        .connect(signer1)
        .initiateTransaction(hre.ethers.parseEther("1"), receiver.address);
    });
  });

  describe("Ownership Transfer", function () {
    it("Should allow the owner to transfer ownership", async function () {
      const { multiSig, owner, newOwner } = await loadFixture(
        deployMultiSigFixture
      );

      await multiSig.connect(owner).transferOwnership(newOwner.address);
      await multiSig.connect(newOwner).claimOwnership();
    });

    it("Should revert if non-owner tries to transfer ownership", async function () {
      const { multiSig, signer1, newOwner } = await loadFixture(
        deployMultiSigFixture
      );

      await expect(
        multiSig.connect(signer1).transferOwnership(newOwner.address)
      ).to.be.revertedWith("not owner");
    });
  });

  describe("Signer Management", function () {
    it("Should allow owner to add a new valid signer", async function () {
      const { multiSig, owner, newOwner } = await loadFixture(
        deployMultiSigFixture
      );

      await multiSig.connect(owner).addValidSigner(newOwner.address);
    });

    it("Should allow owner to remove a signer", async function () {
      const { multiSig, owner } = await loadFixture(deployMultiSigFixture);

      await multiSig.connect(owner).removeSigner(1);
    });

    it("Should revert if non-owner tries to add or remove a signer", async function () {
      const { multiSig, signer1, newOwner } = await loadFixture(
        deployMultiSigFixture
      );

      await expect(
        multiSig.connect(signer1).addValidSigner(newOwner.address)
      ).to.be.revertedWith("not owner");
      await expect(
        multiSig.connect(signer1).removeSigner(1)
      ).to.be.revertedWith("not owner");
    });
  });
});
