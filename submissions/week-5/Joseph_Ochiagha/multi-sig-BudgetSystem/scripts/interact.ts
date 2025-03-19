import { ethers } from "hardhat";
import { OptimizedCompanyFundManager } from "../typechain-types";

async function main() {
  // Your deployed contract address
  const CONTRACT_ADDRESS = "0x2ed7f7f74F5bC49Feb6dBA432056C685e8ce1813";

  // Get signers
  const [admin, treasury, ...signers] = await ethers.getSigners();
  const boardMembers = signers.slice(0, 20); // Get 20 board members

  console.log("Interacting with OptimizedCompanyFundManager");
  console.log("Contract Address:", CONTRACT_ADDRESS);
  console.log("Admin:", admin.address);
  console.log("Treasury:", treasury.address);

  // Get contract instance
  const fundManager = (await ethers.getContractAt(
    "OptimizedCompanyFundManager",
    CONTRACT_ADDRESS
  )) as OptimizedCompanyFundManager;

  try {
    // 1. Check current state
    const currentBoardCount = await fundManager.boardMemberCount();
    console.log("\nCurrent board member count:", currentBoardCount.toString());

    // 2. Add board members if needed
    if (currentBoardCount.toString() !== "20") {
      console.log("\nAdding board members...");
      for (const member of boardMembers) {
        const isMember = await fundManager.isBoardMember(member.address);
        if (!isMember) {
          console.log(`Adding member: ${member.address}`);
          const tx = await fundManager
            .connect(admin)
            .addBoardMember(member.address);
          await tx.wait();
          console.log(`Added board member: ${member.address}`);
        } else {
          console.log(`Member already exists: ${member.address}`);
        }
      }
    }

    // 3. Check updated board count
    const updatedBoardCount = await fundManager.boardMemberCount();
    console.log("\nUpdated board member count:", updatedBoardCount.toString());

    // 4. Propose a new budget
    const proposedBudget = ethers.parseEther("1.0"); // 1 ETH
    console.log(
      "\nProposing budget of",
      ethers.formatEther(proposedBudget),
      "ETH"
    );
    const proposeTx = await fundManager
      .connect(admin)
      .proposeBudget(proposedBudget);
    await proposeTx.wait();

    const currentMonthId = await fundManager.currentMonthId();
    console.log("Budget proposed for month:", currentMonthId.toString());

    // 5. Get signatures from board members
    console.log("\nCollecting signatures...");
    for (const member of boardMembers) {
      const hasSigned = await fundManager.hasSignedBudget(
        currentMonthId,
        member.address
      );
      if (!hasSigned) {
        console.log(`Getting signature from: ${member.address}`);
        const signTx = await fundManager
          .connect(member)
          .signBudget(currentMonthId);
        await signTx.wait();
        console.log(`Signature collected from: ${member.address}`);
      } else {
        console.log(`Already signed by: ${member.address}`);
      }
    }

    // 6. Check budget status
    const signatureCount = await fundManager.getSignatureCount(currentMonthId);
    const isReleased = await fundManager.isBudgetReleased(currentMonthId);
    const contractBalance = await fundManager.getBalance();

    console.log("\nBudget Status:");
    console.log("---------------");
    console.log(`Month ID: ${currentMonthId}`);
    console.log(`Signatures collected: ${signatureCount}`);
    console.log(`Budget released: ${isReleased}`);
    console.log(`Contract balance: ${ethers.formatEther(contractBalance)} ETH`);

    // 7. If budget is released and contract has funds, try withdrawal
    if (isReleased && contractBalance > 0n) {
      console.log("\nAttempting withdrawal...");
      const withdrawAmount = contractBalance / 2n; // Withdraw half the balance
      const withdrawTx = await fundManager
        .connect(admin)
        .withdrawFunds(treasury.address, withdrawAmount);
      await withdrawTx.wait();
      console.log(
        `Withdrawn ${ethers.formatEther(withdrawAmount)} ETH to treasury`
      );
    }

    // 8. Final balance check
    const finalBalance = await fundManager.getBalance();
    console.log(
      "\nFinal contract balance:",
      ethers.formatEther(finalBalance),
      "ETH"
    );
  } catch (error) {
    console.error("Error during interaction:", error);
  }
}

// Execute the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
