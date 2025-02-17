import { ethers } from "hardhat";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const signers = await ethers.getSigners();
  const deployer = signers[0]; 
  console.log(`🚀 Running full automation with deployer: ${deployer.address}`);

  const FUND_ADDRESS = process.env.FUND_ADDRESS!;
  const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS!;
  const RECIPIENT = process.env.RECIPIENT_ADDRESS!;
  const DEPOSIT_AMOUNT = ethers.parseUnits("200", 18); 
  const TRANSACTION_AMOUNT = ethers.parseUnits("50", 18); 

  const token = await ethers.getContractAt("IERC20", TOKEN_ADDRESS, deployer);
  const fund = await ethers.getContractAt("BoardFundManager", FUND_ADDRESS, deployer);

  // Step 1: Deposit ERC20 Tokens
  console.log("🔹 Approving contract to spend ERC20 tokens...");
  const approveTx = await token.approve(FUND_ADDRESS, DEPOSIT_AMOUNT);
  await approveTx.wait();
  console.log(`✅ Approved: ${approveTx.hash}`);

  console.log("🔹 Depositing ERC20 tokens...");
  const depositTx = await fund.depositFunds(DEPOSIT_AMOUNT);
  await depositTx.wait();
  console.log(`✅ Deposit successful! Hash: ${depositTx.hash}`);

  // Step 2: Submit Transaction
  console.log(`🔹 Creating transaction to send ${ethers.formatUnits(TRANSACTION_AMOUNT, 18)} tokens to ${RECIPIENT}...`);
  const submitTx = await fund.addTransaction(RECIPIENT, TRANSACTION_AMOUNT, "0x");
  await submitTx.wait();
  console.log(`✅ Transaction submitted: ${submitTx.hash}`);

  // Step 3: Get Transaction ID
  const transactionCount = await fund.countTransactions();
  const TRANSACTION_ID = Number(transactionCount) - 1;
  console.log(`🔍 Transaction ID: ${TRANSACTION_ID}`);

  // Step 4: Approve Transaction with Multiple Board Members
  console.log("🔹 Approving transaction with board members...");
  for (let i = 0; i < Math.min(20, signers.length); i++) {
    const signer = signers[i];
    const fundWithSigner = fund.connect(signer);
    try {
      const approveTx = await fundWithSigner.approveTransaction(TRANSACTION_ID);
      await approveTx.wait();
      console.log(`✅ Approval from ${signer.address}: ${approveTx.hash}`);
    } catch (error: any) {
      console.error(`❌ Approval failed for ${signer.address}:`, error.reason || error);
    }
  }

  // Step 5: Check Approvals
  const [_, __, ___, executed, approvalCount] = await fund.fetchTransaction(TRANSACTION_ID);
  console.log(`🔍 Approvals: ${Number(approvalCount)}/20`);

  // Step 6: Execute Transaction if Approved
  if (Number(approvalCount) === 20) {
    console.log("🔹 Executing transaction...");
    try {
      const executeTx = await fund.runTransaction(TRANSACTION_ID);
      await executeTx.wait();
      console.log(`✅ Transaction executed: ${executeTx.hash}`);
    } catch (error: any) {
      console.error("❌ Execution failed:", error.reason || error);
    }
  } else {
    console.log("❌ Not enough approvals to execute the transaction.");
  }

  // Step 7: Verify Final Transaction Status
  const [finalTarget, finalAmount, finalPayload, finalExecuted, finalApprovals] = await fund.fetchTransaction(TRANSACTION_ID);
  console.log(`
    ✅ Final Transaction Status:
    - Target: ${finalTarget}
    - Amount: ${ethers.formatUnits(finalAmount, 18)} tokens
    - Executed: ${finalExecuted}
    - Approvals: ${Number(finalApprovals)}/20
  `);
}

main().catch(console.error);
