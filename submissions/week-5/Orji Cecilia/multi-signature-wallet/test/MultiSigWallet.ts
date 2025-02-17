import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("BoardFundManager", function () {
  async function deployFixture() {
    const signers = await ethers.getSigners();

    if (signers.length < 21) {
      throw new Error(`❌ Not enough signers: Found ${signers.length}, but 21 required.`);
    }

    const owner = signers[0];
    const recipient = signers[1];
    const boardMembers = signers.slice(2, 21); // ✅ Exactly 19 board members + owner

    const boardMemberAddresses = boardMembers.map((b) => b.address);

    // ✅ Deploy Mock ERC20 Token
    const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
    const token = await ERC20Mock.deploy("BoardToken", "BTK");
    await token.waitForDeployment();

    // ✅ Mint tokens to owner
    await token.mint(owner.address, ethers.parseUnits("1000", 18));

    // ✅ Deploy BoardFundManager with board members
    const BoardFundManager = await ethers.getContractFactory("BoardFundManager");
    const fundManager = await BoardFundManager.deploy(boardMemberAddresses, token.target);
    await fundManager.waitForDeployment();

    // ✅ Approve and deposit 200 tokens
    await token.connect(owner).approve(fundManager.target, ethers.parseUnits("200", 18));
    await fundManager.connect(owner).depositFunds(ethers.parseUnits("200", 18));

    return { fundManager, token, owner, recipient, boardMembers };
  }

  // ✅ Test for getBoardMembers()
  describe("getBoardMembers()", function () {
    it("Should return the correct list of board members", async function () {
      const { fundManager, boardMembers } = await loadFixture(deployFixture);
      const members = (await fundManager.getBoardMembers()).map((m) => m.toLowerCase()).sort();
      const expected = boardMembers.map((b) => b.address.toLowerCase()).sort();
      expect(members).to.deep.equal(expected);
    });
  });

  // ✅ Test for depositFunds()
  describe("depositFunds()", function () {
    it("Should deposit tokens into the contract", async function () {
      const { fundManager, token } = await loadFixture(deployFixture);
      expect(await token.balanceOf(fundManager.target)).to.equal(ethers.parseUnits("200", 18));
    });

    it("Should fail if deposit amount exceeds allowance", async function () {
      const { fundManager, owner } = await loadFixture(deployFixture);
      await expect(
        fundManager.connect(owner).depositFunds(ethers.parseUnits("1000", 18))
      ).to.be.revertedWithCustomError(fundManager, "TransferFailed");
    });
  });

  // ✅ Test for addTransaction()
  describe("addTransaction()", function () {
    it("Should create a new transaction", async function () {
      const { fundManager, recipient, owner } = await loadFixture(deployFixture);
      await fundManager.connect(owner).addTransaction(recipient.address, ethers.parseUnits("50", 18), "0x");
      expect(await fundManager.countTransactions()).to.equal(1);
    });

    it("Should prevent unauthorized users from submitting transactions", async function () {
      const { fundManager, recipient } = await loadFixture(deployFixture);
      const [, unauthorizedUser] = await ethers.getSigners();
      await expect(
        fundManager.connect(unauthorizedUser).addTransaction(recipient.address, ethers.parseUnits("50", 18), "0x")
      ).to.be.revertedWithCustomError(fundManager, "Unauthorized");
    });
  });

  // ✅ Test for approveTransaction()
  describe("approveTransaction()", function () {
    it("Should allow board members to approve a transaction", async function () {
      const { fundManager, boardMembers, owner } = await loadFixture(deployFixture);
      await fundManager.connect(owner).addTransaction(boardMembers[0].address, ethers.parseUnits("50", 18), "0x");

      for (let i = 0; i < 5; i++) {
        await fundManager.connect(boardMembers[i]).approveTransaction(0);
      }

      const [, , , , approvalCount] = await fundManager.fetchTransaction(0);
      expect(approvalCount).to.equal(5);
    });

    it("Should prevent duplicate approvals by the same member", async function () {
      const { fundManager, boardMembers, owner } = await loadFixture(deployFixture);
      await fundManager.connect(owner).addTransaction(boardMembers[0].address, ethers.parseUnits("50", 18), "0x");

      await fundManager.connect(boardMembers[0]).approveTransaction(0);
      await expect(fundManager.connect(boardMembers[0]).approveTransaction(0)).to.be.revertedWithCustomError(
        fundManager,
        "TransactionAlreadyApproved"
      );
    });
  });

  // ✅ Test for retractApproval()
  describe("retractApproval()", function () {
    it("Should allow a board member to revoke their approval", async function () {
      const { fundManager, boardMembers, owner } = await loadFixture(deployFixture);
      await fundManager.connect(owner).addTransaction(boardMembers[0].address, ethers.parseUnits("50", 18), "0x");

      await fundManager.connect(boardMembers[0]).approveTransaction(0);
      await fundManager.connect(boardMembers[0]).retractApproval(0);

      const [, , , , approvalCount] = await fundManager.fetchTransaction(0);
      expect(approvalCount).to.equal(0);
    });

    it("Should prevent revoking approval if not approved previously", async function () {
      const { fundManager, boardMembers, owner } = await loadFixture(deployFixture);
      await fundManager.connect(owner).addTransaction(boardMembers[0].address, ethers.parseUnits("50", 18), "0x");

      await expect(fundManager.connect(boardMembers[0]).retractApproval(0)).to.be.revertedWithCustomError(
        fundManager,
        "NoPriorApproval"
      );
    });
  });

  // ✅ Test for executeTransaction()
  describe("executeTransaction()", function () {
    it("Should execute a transaction after required approvals", async function () {
      const { fundManager, token, recipient, boardMembers, owner } = await loadFixture(deployFixture);
      await fundManager.connect(owner).addTransaction(recipient.address, ethers.parseUnits("50", 18), "0x");

      for (let i = 0; i < 19; i++) {
        await fundManager.connect(boardMembers[i]).approveTransaction(0);
      }

      await fundManager.connect(boardMembers[0]).runTransaction(0);
      expect(await token.balanceOf(recipient.address)).to.equal(ethers.parseUnits("50", 18));
    });

    it("Should revert if executed without enough approvals", async function () {
      const { fundManager, recipient, boardMembers, owner } = await loadFixture(deployFixture);
      await fundManager.connect(owner).addTransaction(recipient.address, ethers.parseUnits("50", 18), "0x");

      await fundManager.connect(boardMembers[0]).approveTransaction(0);

      await expect(fundManager.connect(owner).runTransaction(0)).to.be.revertedWithCustomError(
        fundManager,
        "ApprovalRequired"
      );
    });
  });

  // ✅ Test for fetchTransaction()
  describe("fetchTransaction()", function () {
    it("Should return correct transaction details", async function () {
      const { fundManager, recipient, owner } = await loadFixture(deployFixture);
      await fundManager.connect(owner).addTransaction(recipient.address, ethers.parseUnits("50", 18), "0x");

      const [target, amount, payload, executed, approvalCount] = await fundManager.fetchTransaction(0);

      expect(target).to.equal(recipient.address);
      expect(amount).to.equal(ethers.parseUnits("50", 18));
      expect(executed).to.be.false;
      expect(approvalCount).to.equal(0);
    });
  });
});
