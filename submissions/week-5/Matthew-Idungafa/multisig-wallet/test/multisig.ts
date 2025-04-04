import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("CompanyFundManager", function () {
  async function deployFundManagerFixture() {
    // Get 20 signers for board members plus one extra for testing unauthorized access
    const signers = await ethers.getSigners();
    const [unauthorized, ...boardMembers] = signers;
    
    // Ensure we have enough signers
    if (boardMembers.length < 20) { 
      throw new Error("Not enough signers for testing. Need at least 21 accounts.");
    }

    // Take only the first 20 addresses for board members
    const boardMemberAddresses = boardMembers.slice(0, 20).map(signer => signer.address);

    const FundManager = await ethers.getContractFactory("CompanyFundManager");
    const fundManager = await FundManager.deploy(boardMemberAddresses);

    return { 
      fundManager, 
      unauthorized, 
      boardMembers: boardMembers.slice(0, 20),
      boardMemberAddresses 
    };
  }

  describe("Deployment", function () {
    it("Should initialize with exactly 20 board members", async function () {
      const { fundManager, boardMemberAddresses } = await loadFixture(deployFundManagerFixture);
      const members = await fundManager.getBoardMembers();
      expect(members.length).to.equal(20);
      expect(members).to.deep.equal(boardMemberAddresses);
    });

    it("Should correctly set board member status", async function () {
      const { fundManager, boardMembers, unauthorized } = await loadFixture(deployFundManagerFixture);
      
      // Check all board members are recognized
      for (const member of boardMembers) {
        expect(await fundManager.isBoardMember(member.address)).to.be.true;
      }

      // Check unauthorized address is not recognized
      expect(await fundManager.isBoardMember(unauthorized.address)).to.be.false;
    });
  });

  describe("Budget Proposals", function () {
    it("Should allow a board member to propose a budget", async function () {
      const { fundManager, boardMembers } = await loadFixture(deployFundManagerFixture);
      const [proposer] = boardMembers;
      const amount = ethers.parseEther("1.0");
      
      await expect(fundManager.connect(proposer).proposeBudget(
        proposer.address,
        amount,
        ethers.encodeBytes32String("Office Supplies")
      )).to.not.be.reverted;

      const proposal = await fundManager.getBudgetProposal(0);
      expect(proposal.recipient).to.equal(proposer.address);
      expect(proposal.amount).to.equal(amount);
    });

    it("Should revert when unauthorized user proposes budget", async function () {
      const { fundManager, unauthorized } = await loadFixture(deployFundManagerFixture);
      const amount = ethers.parseEther("1.0");
      
      await expect(fundManager.connect(unauthorized).proposeBudget(
        unauthorized.address,
        amount,
        ethers.encodeBytes32String("Unauthorized Proposal")
      )).to.be.revertedWithCustomError(fundManager, "NotBoardMember");
    });
  });

  describe("Budget Approvals", function () {
    async function proposeBudgetFixture() {
      const baseFixture = await deployFundManagerFixture();
      const amount = ethers.parseEther("1.0");
      
      await baseFixture.fundManager.connect(baseFixture.boardMembers[0]).proposeBudget(
        baseFixture.boardMembers[0].address,
        amount,
        ethers.encodeBytes32String("Test Budget")
      );

      return { ...baseFixture, amount };
    }

    it("Should track approvals correctly", async function () {
      const { fundManager, boardMembers } = await proposeBudgetFixture();
      
      // Have first 10 members approve
      for (let i = 0; i < 10; i++) {
        await fundManager.connect(boardMembers[i]).approveBudget(0);
        const proposal = await fundManager.getBudgetProposal(0);
        expect(proposal.approvalCount).to.equal(i + 1);
      }
    });

    it("Should not allow double approval", async function () {
      const { fundManager, boardMembers } = await proposeBudgetFixture();
      
      await fundManager.connect(boardMembers[0]).approveBudget(0);
      await expect(
        fundManager.connect(boardMembers[0]).approveBudget(0)
      ).to.be.revertedWithCustomError(fundManager, "AlreadyApproved");
    });

    it("Should only execute budget with all 20 approvals", async function () {
      const { fundManager, boardMembers, amount } = await proposeBudgetFixture();
      
      // Fund the contract
      await boardMembers[0].sendTransaction({
        to: await fundManager.getAddress(),
        value: amount
      });

      // Have 19 members approve
      for (let i = 0; i < 19; i++) {
        await fundManager.connect(boardMembers[i]).approveBudget(0);
      }

      // Try to execute - should fail
      await expect(
        fundManager.connect(boardMembers[0]).executeBudget(0)
      ).to.be.revertedWithCustomError(fundManager, "InsufficientApprovals");

      // Get last approval and execute
      await fundManager.connect(boardMembers[19]).approveBudget(0);
      await expect(
        fundManager.connect(boardMembers[0]).executeBudget(0)
      ).to.not.be.reverted;
    });
  });

  describe("Fund Management", function () {
    it("Should track deposits correctly", async function () {
      const { fundManager, boardMembers } = await loadFixture(deployFundManagerFixture);
      const amount = ethers.parseEther("1.0");

      await expect(boardMembers[0].sendTransaction({
        to: await fundManager.getAddress(),
        value: amount
      })).to.emit(fundManager, "FundsDeposited")
        .withArgs(boardMembers[0].address, amount, amount);
    });

    it("Should only release funds after full approval", async function () {
      const { fundManager, boardMembers } = await loadFixture(deployFundManagerFixture);
      const amount = ethers.parseEther("1.0");
      
      // Fund the contract
      await boardMembers[0].sendTransaction({
        to: await fundManager.getAddress(),
        value: amount
      });

      // Create proposal
      await fundManager.connect(boardMembers[0]).proposeBudget(
        boardMembers[1].address,
        amount,
        ethers.encodeBytes32String("Test Budget")
      );

      // Get all approvals
      for (const member of boardMembers) {
        await fundManager.connect(member).approveBudget(0);
      }

      // Check balance before execution
      const recipientBalanceBefore = await ethers.provider.getBalance(boardMembers[1].address);
      
      // Execute the budget
      await fundManager.connect(boardMembers[0]).executeBudget(0);

      // Verify funds were transferred
      const recipientBalanceAfter = await ethers.provider.getBalance(boardMembers[1].address);
      expect(recipientBalanceAfter - recipientBalanceBefore).to.equal(amount);
    });
  });
});