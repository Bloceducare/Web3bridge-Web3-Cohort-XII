import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { MultiSigWallet } from "../typechain-types";

describe("MultiSigWallet", function () {
  let multiSigWallet: MultiSigWallet;
  let owner: SignerWithAddress;
  let boardMembers: SignerWithAddress[];
  let nonBoardMember: SignerWithAddress;

  beforeEach(async function () {
    // Get signers
    const signers = await ethers.getSigners();
    owner = signers[0];
    // console.log(signers)
    // Ensure we have exactly 20 board members
    if (signers.length < 20) {
      throw new Error("Not enough signers available. At least 21 signers are required.");
    }
    boardMembers = signers.slice(0, 20); // Take signers 1 to 20
    nonBoardMember = ethers.Wallet.createRandom();
    // console.log(nonBoardMember) // Use signer 21 as a non-board member

    // Deploy the contract
    const MultiSigWalletFactory = await ethers.getContractFactory("MultiSigWallet");
    multiSigWallet = (await MultiSigWalletFactory.deploy(
      boardMembers.map((member) => member.address)
    )) as MultiSigWallet;
    // await multiSigWallet.deployed();
  });

  it("Should deploy with 20 board members", async function () {
    const members = await multiSigWallet.getBoardMembers();
    expect(members.length).to.equal(20);
  });

  it("Should allow board members to propose an expense", async function () {
    const amount = ethers.parseEther("100");
    await multiSigWallet.deposit({value:amount})
    await multiSigWallet.connect(boardMembers[0]).proposeExpense(amount, boardMembers[1].address);
    const expense = await multiSigWallet.expenses(0);
    expect(expense.amount).to.equal(amount);
    expect(expense.recipient).to.equal(boardMembers[1].address);
  });

  it("Should not allow non-board members to propose an expense", async function () {
    const amount = ethers.parseEther("100");
    await expect(
      multiSigWallet.connect(nonBoardMember).proposeExpense(amount, boardMembers[1].address)
    ).to.be.revertedWith("NotABoardMember");
  });

  it("Should allow board members to approve an expense", async function () {
    const amount = ethers.parseEther("100");
    await multiSigWallet.deposit({value:amount})
    await multiSigWallet.connect(boardMembers[0]).proposeExpense(amount, boardMembers[1].address);
    await multiSigWallet.connect(boardMembers[0]).approveExpense(0);
    const expense = await multiSigWallet.getApprovals(0);
    expect(expense).to.be.true;
  });

  it("Should not allow non-board members to approve an expense", async function () {
    const amount = ethers.parseEther("100");
    await multiSigWallet.deposit({value:amount})
    await multiSigWallet.connect(boardMembers[0]).proposeExpense(amount, boardMembers[1].address);
    await expect(
      multiSigWallet.connect(nonBoardMember).approveExpense(0)
    ).to.be.revertedWith("NotABoardMember");
  });

  it("Should release funds when fully approved", async function () {
    const amount = ethers.parseEther("100");
    await multiSigWallet.deposit({value:amount})
    await multiSigWallet.connect(boardMembers[0]).proposeExpense(100, boardMembers[1].address);
    for (let i = 0; i < 20; i++) {
      await multiSigWallet.connect(boardMembers[i]).approveExpense(0);
    }
    await multiSigWallet.connect(boardMembers[0]).releaseFunds(0);
    const expense = await multiSigWallet.expenses(0);
    expect(expense.executed).to.be.true;
  });

  it("Should not release funds if not fully approved", async function () {
    const amount = ethers.parseEther("100");
    await multiSigWallet.deposit({value:amount})
    await multiSigWallet.connect(boardMembers[0]).proposeExpense(100, boardMembers[1].address);
    await expect(
      multiSigWallet.connect(boardMembers[0]).releaseFunds(0)
    ).to.be.revertedWith("NotFullyApproved");
  });
});