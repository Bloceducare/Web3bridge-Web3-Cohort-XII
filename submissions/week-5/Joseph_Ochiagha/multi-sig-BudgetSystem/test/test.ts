import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
// import { OptimizedCompanyFundManager } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("OptimizedCompanyFundManager", function () {
  async function deployFundManagerFixture() {
    // Get signers
    const [admin, treasury, ...signers] = await ethers.getSigners();

    // Ensure we have enough signers for board members
    if (signers.length < 20) {
      throw new Error("Not enough signers available!");
    }

    // Get board members (20 signers)
    const boardMembers = signers.slice(0, 20);

    // Deploy the contract
    const FundManager = await ethers.getContractFactory(
      "OptimizedCompanyFundManager"
    );
    const fundManager = await FundManager.deploy(treasury.address);
    await fundManager.waitForDeployment();

    return {
      fundManager,
      admin,
      boardMembers,
      treasury,
    };
  }

  describe("Deployment", function () {
    it("Should set the right admin", async function () {
      const { fundManager, admin } = await loadFixture(
        deployFundManagerFixture
      );
      expect(await fundManager.admin()).to.equal(admin.address);
    });

    it("Should set the right treasury", async function () {
      const { fundManager, treasury } = await loadFixture(
        deployFundManagerFixture
      );
      expect(await fundManager.companyTreasury()).to.equal(treasury.address);
    });
  });

  describe("Board Member Management", function () {
    it("Should add board members", async function () {
      const { fundManager, admin, boardMembers } = await loadFixture(
        deployFundManagerFixture
      );

      for (const member of boardMembers) {
        await fundManager.connect(admin).addBoardMember(member.address);
        expect(await fundManager.isBoardMember(member.address)).to.be.true;
      }

      expect(await fundManager.boardMemberCount()).to.equal(20);
    });

    it("Should not allow adding more than 20 members", async function () {
      const { fundManager, admin, boardMembers } = await loadFixture(
        deployFundManagerFixture
      );

      // Add 20 members
      for (const member of boardMembers) {
        await fundManager.connect(admin).addBoardMember(member.address);
      }

      // Try to add one more
      await expect(
        fundManager.connect(admin).addBoardMember(admin.address)
      ).to.be.revertedWith("Board is full");
    });
  });

  describe("Budget Management", function () {
    it("Should propose a budget when all members are added", async function () {
      const { fundManager, admin, boardMembers } = await loadFixture(
        deployFundManagerFixture
      );

      // Add all board members
      for (const member of boardMembers) {
        await fundManager.connect(admin).addBoardMember(member.address);
      }

      // Propose budget
      const budgetAmount = ethers.parseEther("10");
      await expect(fundManager.connect(admin).proposeBudget(budgetAmount))
        .to.emit(fundManager, "BudgetProposed")
        .withArgs(1, budgetAmount); // First budget, ID should be 1
    });

    it("Should collect signatures and release budget", async function () {
      const { fundManager, admin, boardMembers } = await loadFixture(
        deployFundManagerFixture
      );

      // Add all board members
      for (const member of boardMembers) {
        await fundManager.connect(admin).addBoardMember(member.address);
      }

      // Propose budget
      const budgetAmount = ethers.parseEther("10");
      await fundManager.connect(admin).proposeBudget(budgetAmount);

      // Get all signatures
      for (const member of boardMembers) {
        await fundManager.connect(member).signBudget(1);
      }

      // Check if budget is released
      expect(await fundManager.isBudgetReleased(1)).to.be.true;
    });
  });

  describe("Fund Management", function () {
    it("Should allow withdrawing funds after budget approval", async function () {
      const { fundManager, admin, boardMembers, treasury } = await loadFixture(
        deployFundManagerFixture
      );

      // Add members and approve budget
      for (const member of boardMembers) {
        await fundManager.connect(admin).addBoardMember(member.address);
      }

      const budgetAmount = ethers.parseEther("10");
      await fundManager.connect(admin).proposeBudget(budgetAmount);

      // Sign budget
      for (const member of boardMembers) {
        await fundManager.connect(member).signBudget(1);
      }

      // Send funds to contract
      await admin.sendTransaction({
        to: await fundManager.getAddress(),
        value: budgetAmount,
      });

      // Withdraw funds
      const withdrawAmount = ethers.parseEther("5");
      await expect(
        fundManager
          .connect(admin)
          .withdrawFunds(treasury.address, withdrawAmount)
      ).to.changeEtherBalance(treasury, withdrawAmount);
    });
  });
  describe("Access Control", function () {
    it("Should only allow admin to add board members", async function () {
      const { fundManager, boardMembers } = await loadFixture(
        deployFundManagerFixture
      );

      await expect(
        fundManager
          .connect(boardMembers[0])
          .addBoardMember(boardMembers[1].address)
      ).to.be.revertedWith("Only admin can call this function");
    });

    it("Should only allow admin to remove board members", async function () {
      const { fundManager, admin, boardMembers } = await loadFixture(
        deployFundManagerFixture
      );

      // First add a member
      await fundManager.connect(admin).addBoardMember(boardMembers[0].address);

      // Try to remove with non-admin
      await expect(
        fundManager
          .connect(boardMembers[1])
          .removeBoardMember(boardMembers[0].address)
      ).to.be.revertedWith("Only admin can call this function");
    });

    it("Should only allow board members to sign budget", async function () {
      const { fundManager, admin, boardMembers, treasury } = await loadFixture(
        deployFundManagerFixture
      );

      // Add members and propose budget
      for (const member of boardMembers) {
        await fundManager.connect(admin).addBoardMember(member.address);
      }
      await fundManager.connect(admin).proposeBudget(ethers.parseEther("10"));

      // Try to sign with non-board member
      await expect(
        fundManager.connect(treasury).signBudget(1)
      ).to.be.revertedWith("Only board members can call this function");
    });
  });

  describe("Budget Signing Process", function () {
    it("Should not allow signing inactive budget", async function () {
      const { fundManager, admin, boardMembers } = await loadFixture(
        deployFundManagerFixture
      );

      // First add the member to avoid "Only board members" error
      await fundManager.connect(admin).addBoardMember(boardMembers[0].address);

      // Now try to sign non-existent budget
      await expect(
        fundManager.connect(boardMembers[0]).signBudget(1)
      ).to.be.revertedWith("Budget is not active");
    });

    it("Should not allow signing already released budget", async function () {
      const { fundManager, admin, boardMembers } = await loadFixture(
        deployFundManagerFixture
      );

      // Add members and propose budget
      for (const member of boardMembers) {
        await fundManager.connect(admin).addBoardMember(member.address);
      }
      await fundManager.connect(admin).proposeBudget(ethers.parseEther("10"));

      // Get all signatures
      for (const member of boardMembers) {
        await fundManager.connect(member).signBudget(1);
      }

      // Try to sign again
      await expect(
        fundManager.connect(boardMembers[0]).signBudget(1)
      ).to.be.revertedWith("Budget already released");
    });

    it("Should not allow signing twice", async function () {
      const { fundManager, admin, boardMembers } = await loadFixture(
        deployFundManagerFixture
      );

      // Add members and propose budget
      for (const member of boardMembers) {
        await fundManager.connect(admin).addBoardMember(member.address);
      }
      await fundManager.connect(admin).proposeBudget(ethers.parseEther("10"));

      // Sign once
      await fundManager.connect(boardMembers[0]).signBudget(1);

      // Try to sign again
      await expect(
        fundManager.connect(boardMembers[0]).signBudget(1)
      ).to.be.revertedWith("Already signed");
    });
  });

  describe("Fund Management Extended", function () {
    it("Should not allow withdrawal without budget release", async function () {
      const { fundManager, admin, boardMembers, treasury } = await loadFixture(
        deployFundManagerFixture
      );

      // Add all board members first
      for (const member of boardMembers) {
        await fundManager.connect(admin).addBoardMember(member.address);
      }

      // Propose a budget
      await fundManager.connect(admin).proposeBudget(ethers.parseEther("10"));

      // Fund the contract first to avoid "Insufficient balance" error
      await admin.sendTransaction({
        to: await fundManager.getAddress(),
        value: ethers.parseEther("10"),
      });

      // Try to withdraw before budget is signed
      await expect(
        fundManager
          .connect(admin)
          .withdrawFunds(treasury.address, ethers.parseEther("1"))
      ).to.be.revertedWith("Current budget not released");
    });

    it("Should not allow withdrawal exceeding contract balance", async function () {
      const { fundManager, admin, boardMembers, treasury } = await loadFixture(
        deployFundManagerFixture
      );

      // Add members and approve budget
      for (const member of boardMembers) {
        await fundManager.connect(admin).addBoardMember(member.address);
      }
      await fundManager.connect(admin).proposeBudget(ethers.parseEther("10"));

      // Sign budget
      for (const member of boardMembers) {
        await fundManager.connect(member).signBudget(1);
      }

      // Try to withdraw more than balance
      await expect(
        fundManager
          .connect(admin)
          .withdrawFunds(treasury.address, ethers.parseEther("100"))
      ).to.be.revertedWith("Insufficient balance");
    });

    it("Should track contract balance correctly", async function () {
      const { fundManager, admin } = await loadFixture(
        deployFundManagerFixture
      );

      // Send funds to contract
      const amount = ethers.parseEther("1");
      await admin.sendTransaction({
        to: await fundManager.getAddress(),
        value: amount,
      });

      expect(await fundManager.getBalance()).to.equal(amount);
    });
  });

  describe("Board Member Removal", function () {
    it("Should remove board member correctly", async function () {
      const { fundManager, admin, boardMembers } = await loadFixture(
        deployFundManagerFixture
      );

      // Add a member
      await fundManager.connect(admin).addBoardMember(boardMembers[0].address);
      expect(await fundManager.boardMemberCount()).to.equal(1);

      // Remove the member
      await fundManager
        .connect(admin)
        .removeBoardMember(boardMembers[0].address);
      expect(await fundManager.boardMemberCount()).to.equal(0);
      expect(await fundManager.isBoardMember(boardMembers[0].address)).to.be
        .false;
    });

    it("Should not remove non-existent member", async function () {
      const { fundManager, admin, boardMembers } = await loadFixture(
        deployFundManagerFixture
      );

      await expect(
        fundManager.connect(admin).removeBoardMember(boardMembers[0].address)
      ).to.be.revertedWith("Member not found");
    });
  });

  describe("Events", function () {
    it("Should emit all events in complete workflow", async function () {
      const { fundManager, admin, boardMembers, treasury } = await loadFixture(
        deployFundManagerFixture
      );

      // Add all board members first (required by contract)
      for (const member of boardMembers) {
        await expect(fundManager.connect(admin).addBoardMember(member.address))
          .to.emit(fundManager, "BoardMemberAdded")
          .withArgs(member.address);
      }

      // Propose budget
      const budgetAmount = ethers.parseEther("10");
      await expect(fundManager.connect(admin).proposeBudget(budgetAmount))
        .to.emit(fundManager, "BudgetProposed")
        .withArgs(1, budgetAmount);

      // Sign budget with first member
      await expect(fundManager.connect(boardMembers[0]).signBudget(1))
        .to.emit(fundManager, "BudgetSigned")
        .withArgs(1, boardMembers[0].address);
    });

    // Add a test for complete budget approval
    it("Should emit all events in complete budget approval", async function () {
      const { fundManager, admin, boardMembers } = await loadFixture(
        deployFundManagerFixture
      );

      // Add all board members
      for (const member of boardMembers) {
        await fundManager.connect(admin).addBoardMember(member.address);
      }

      // Propose budget
      const budgetAmount = ethers.parseEther("10");
      await expect(fundManager.connect(admin).proposeBudget(budgetAmount))
        .to.emit(fundManager, "BudgetProposed")
        .withArgs(1, budgetAmount);

      // Sign with all members
      for (const member of boardMembers) {
        await expect(fundManager.connect(member).signBudget(1))
          .to.emit(fundManager, "BudgetSigned")
          .withArgs(1, member.address);
      }

      // Verify budget is released
      expect(await fundManager.isBudgetReleased(1)).to.be.true;
    });

    it("Should emit correct events for member removal", async function () {
      const { fundManager, admin, boardMembers } = await loadFixture(
        deployFundManagerFixture
      );

      // Add a member first
      await fundManager.connect(admin).addBoardMember(boardMembers[0].address);

      // Remove the member and verify event
      await expect(
        fundManager.connect(admin).removeBoardMember(boardMembers[0].address)
      )
        .to.emit(fundManager, "BoardMemberRemoved")
        .withArgs(boardMembers[0].address);
    });
  });
  it("Should emit BoardMemberRemoved event", async function () {
    const { fundManager, admin, boardMembers } = await loadFixture(
      deployFundManagerFixture
    );

    await fundManager.connect(admin).addBoardMember(boardMembers[0].address);

    await expect(
      fundManager.connect(admin).removeBoardMember(boardMembers[0].address)
    )
      .to.emit(fundManager, "BoardMemberRemoved")
      .withArgs(boardMembers[0].address);
  });
});
