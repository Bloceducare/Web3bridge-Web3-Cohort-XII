// import { ethers } from "hardhat";
// import fs from "fs";

// // Utility function to get deployed addresses
// async function getDeployedAddresses() {
//   const network = process.env.HARDHAT_NETWORK || "hardhat";
//   const deploymentPath = `./deployments/${network}.json`;
  
//   if (!fs.existsSync(deploymentPath)) {
//     throw new Error(`No deployment found for network ${network}`);
//   }
  
//   return JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
// }

// // Format ETH amounts for display
// function formatAmount(amount: bigint): string {
//   return `${ethers.formatEther(amount)} ETH`;
// }

// // Add a budget proposal
// async function proposeBudget(fundManager: any, proposer: any, amount: bigint, description: string) {
//   console.log("\nProposing new budget...");
//   const tx = await fundManager.connect(proposer).proposeBudget(
//     proposer.address,
//     amount,
//     ethers.encodeBytes32String(description)
//   );
//   await tx.wait();
  
//   const proposalId = (await fundManager.getBudgetCount()) - 1;
//   console.log(`Budget proposed: ID ${proposalId}`);
//   console.log(`Amount: ${formatAmount(amount)}`);
//   console.log(`Description: ${description}`);
  
//   return proposalId;
// }

// // Get all approvals for a budget
// async function approveBudget(fundManager: any, budgetId: number, boardMembers: any[]) {
//   console.log(`\nGathering approvals for budget ${budgetId}...`);
  
//   for (let i = 0; i < boardMembers.length; i++) {
//     try {
//       // Check if member has already approved
//       const hasApproved = await fundManager.hasApproved(budgetId, boardMembers[i].address);
//       if (hasApproved) {
//         console.log(`Board member ${i + 1} has already approved`);
//         continue;
//       }

//       // Get approval
//       const tx = await fundManager.connect(boardMembers[i]).approveBudget(budgetId);
//       await tx.wait();
//       console.log(`Board member ${i + 1} approved the budget`);

//     } catch (error: any) {
//       console.error(`Error getting approval from board member ${i + 1}:`, error.message);
//     }
//   }

//   // Get final approval count
//   const proposal = await fundManager.getBudgetProposal(budgetId);
//   console.log(`\nCurrent approval count: ${proposal.approvalCount}/20`);
// }

// // Execute a fully approved budget
// async function executeBudget(fundManager: any, budgetId: number, executor: any) {
//   console.log(`\nAttempting to execute budget ${budgetId}...`);
  
//   try {
//     const proposal = await fundManager.getBudgetProposal(budgetId);
    
//     if (proposal.executed) {
//       console.log("Budget has already been executed");
//       return;
//     }

//     if (proposal.approvalCount < 20) {
//       console.log(`Insufficient approvals: ${proposal.approvalCount}/20`);
//       return;
//     }

//     const tx = await fundManager.connect(executor).executeBudget(budgetId);
//     await tx.wait();
    
//     console.log("Budget executed successfully!");
//     console.log(`Amount transferred: ${formatAmount(proposal.amount)}`);
//     console.log(`Recipient: ${proposal.recipient}`);

//   } catch (error: any) {
//     console.error("Error executing budget:", error.message);
//   }
// }

// // Get budget proposal details
// async function getBudgetDetails(fundManager: any, budgetId: number) {
//   try {
//     const proposal = await fundManager.getBudgetProposal(budgetId);
    
//     console.log("\nBudget Proposal Details:");
//     console.log("------------------------");
//     console.log(`ID: ${budgetId}`);
//     console.log(`Recipient: ${proposal.recipient}`);
//     console.log(`Amount: ${formatAmount(proposal.amount)}`);
//     console.log(`Approval Count: ${proposal.approvalCount}/20`);
//     console.log(`Executed: ${proposal.executed}`);
    
//     return proposal;
//   } catch (error: any) {
//     console.error("Error getting budget details:", error.message);
//   }
// }

// // Main function to demonstrate the fund management process
// async function main() {
//   try {
//     // Get contract instance
//     const { fundManager: fundManagerAddress, boardMembers: boardMemberAddresses } = await getDeployedAddresses();
//     const fundManager = await ethers.getContractAt("CompanyFundManager", fundManagerAddress);
    
//     // Get signers
//     const signers = await ethers.getSigners();
//     const boardMembers = signers.slice(0, 20); // Get first 20 signers as board members
    
//     console.log("Company Fund Manager Interaction Script");
//     console.log(`Contract Address: ${fundManagerAddress}`);

//     // Fund the contract (for testing purposes)
//     const fundAmount = ethers.parseEther("10.0");
//     await boardMembers[0].sendTransaction({
//       to: fundManagerAddress,
//       value: fundAmount
//     });
//     console.log(`\nContract funded with ${formatAmount(fundAmount)}`);

//     // Propose a new budget
//     const budgetAmount = ethers.parseEther("1.0");
//     const budgetId = await proposeBudget(
//       fundManager,
//       boardMembers[0],
//       budgetAmount,
//       "Q1 Office Supplies"
//     );

//     // Get approvals from all board members
//     await approveBudget(fundManager, budgetId, boardMembers);

//     // Get budget details
//     await getBudgetDetails(fundManager, budgetId);

//     // Execute the budget
//     await executeBudget(fundManager, budgetId, boardMembers[0]);

//     console.log("\nScript execution completed!");

//   } catch (error) {
//     console.error("Error:", error);
//     process.exitCode = 1;
//   }
// }

// // Execute if running this script directly
// if (require.main === module) {
//   main().catch((error) => {
//     console.error(error);
//     process.exitCode = 1;
//   });
// }

// export {
//   proposeBudget,
//   approveBudget,
//   executeBudget,
//   getBudgetDetails
// };


import { ethers } from "hardhat";
import fs from "fs";

// Utility function to get deployed addresses
async function getDeployedAddresses() {
  const network = process.env.HARDHAT_NETWORK || "hardhat";
  const deploymentPath = `./deployments/${network}.json`;
  
  if (!fs.existsSync(deploymentPath)) {
    throw new Error(`No deployment found for network ${network}`);
  }
  
  return JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
}

// Format ETH amounts for display
function formatAmount(amount: bigint): string {
  return `${ethers.formatEther(amount)} ETH`;
}

// Add a budget proposal
async function proposeBudget(fundManager: any, proposer: any, amount: bigint, description: string) {
  console.log("\nProposing new budget...");
  const tx = await fundManager.connect(proposer).proposeBudget(
    proposer.address,
    amount,
    ethers.encodeBytes32String(description)
  );
  await tx.wait();
  
  const proposalId = (await fundManager.getBudgetCount()) - 1;
  console.log(`Budget proposed: ID ${proposalId}`);
  console.log(`Amount: ${formatAmount(amount)}`);
  console.log(`Description: ${description}`);
  
  return proposalId;
}

// Get all approvals for a budget
async function approveBudget(fundManager: any, budgetId: number, boardMembers: any[]) {
  console.log(`\nGathering approvals for budget ${budgetId}...`);
  
  for (let i = 0; i < boardMembers.length; i++) {
    try {
      // Check if member has already approved
      const hasApproved = await fundManager.hasApproved(budgetId, boardMembers[i].address);
      if (hasApproved) {
        console.log(`Board member ${i + 1} has already approved`);
        continue;
      }

      // Get approval
      const tx = await fundManager.connect(boardMembers[i]).approveBudget(budgetId);
      await tx.wait();
      console.log(`Board member ${i + 1} approved the budget`);

    } catch (error: any) {
      console.error(`Error getting approval from board member ${i + 1}:`, error.message);
    }
  }

  // Get final approval count
  const proposal = await fundManager.getBudgetProposal(budgetId);
  console.log(`\nCurrent approval count: ${proposal.approvalCount}/20`);
}

// Execute a fully approved budget
async function executeBudget(fundManager: any, budgetId: number, executor: any) {
  console.log(`\nAttempting to execute budget ${budgetId}...`);
  
  try {
    const proposal = await fundManager.getBudgetProposal(budgetId);
    
    if (proposal.executed) {
      console.log("Budget has already been executed");
      return;
    }

    if (proposal.approvalCount < 20) {
      console.log(`Insufficient approvals: ${proposal.approvalCount}/20`);
      return;
    }

    const tx = await fundManager.connect(executor).executeBudget(budgetId);
    await tx.wait();
    
    console.log("Budget executed successfully!");
    console.log(`Amount transferred: ${formatAmount(proposal.amount)}`);
    console.log(`Recipient: ${proposal.recipient}`);

  } catch (error: any) {
    console.error("Error executing budget:", error.message);
  }
}

// Get budget proposal details
async function getBudgetDetails(fundManager: any, budgetId: number) {
  try {
    const proposal = await fundManager.getBudgetProposal(budgetId);
    
    console.log("\nBudget Proposal Details:");
    console.log("------------------------");
    console.log(`ID: ${budgetId}`);
    console.log(`Recipient: ${proposal.recipient}`);
    console.log(`Amount: ${formatAmount(proposal.amount)}`);
    console.log(`Approval Count: ${proposal.approvalCount}/20`);
    console.log(`Executed: ${proposal.executed}`);
    
    return proposal;
  } catch (error: any) {
    console.error("Error getting budget details:", error.message);
  }
}

// Main function to demonstrate the fund management process
async function main() {
  try {
    // Get contract instance
    const { fundManager: fundManagerAddress } = await getDeployedAddresses();
    const fundManager = await ethers.getContractAt("CompanyFundManager", fundManagerAddress);
    
    // Get signers
    const signers = await ethers.getSigners();
    
    console.log("Company Fund Manager Interaction Script");
    console.log(`Contract Address: ${fundManagerAddress}`);

    // Fund the contract with a smaller amount for testing
    const fundAmount = ethers.parseEther("0.005"); // Reduced to 0.005 ETH
    console.log(`\nFunding contract with ${formatAmount(fundAmount)}...`);
    
    const tx = await signers[0].sendTransaction({
      to: fundManagerAddress,
      value: fundAmount
    });
    await tx.wait();
    console.log("Funding successful!");

    // Propose a new budget with a smaller amount
    const budgetAmount = ethers.parseEther("0.001"); // Reduced to 0.001 ETH
    const budgetId = await proposeBudget(
      fundManager,
      signers[0],
      budgetAmount,
      "Test Budget Proposal"
    );

    // Get budget details
    await getBudgetDetails(fundManager, budgetId);

    console.log("\nScript execution completed!");
    console.log("\nNote: For full approval and execution, you'll need all 20 board members to approve.");
    console.log("This test only demonstrates the proposal process.");

  } catch (error) {
    console.error("Error:", error);
    process.exitCode = 1;
  }
}

// Execute if running this script directly
if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

export {
  proposeBudget,
  approveBudget,
  executeBudget,
  getBudgetDetails
};