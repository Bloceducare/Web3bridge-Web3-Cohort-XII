import { ethers } from "hardhat";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const FUND_ADDRESS = process.env.FUND_ADDRESS!;
  const TRANSACTION_ID = 0;

  const fund = await ethers.getContractAt("BoardFundManager", FUND_ADDRESS);

  const transactionCount = await fund.countTransactions();
  if (Number(transactionCount) === 0) { // Convert BigInt to number
    console.log("❌ No transactions found!");
    return;
  }

  console.log(`🔍 Checking approvals for Transaction ID: ${TRANSACTION_ID}`);

  const [_, __, ___, executed, approvalCount] = await fund.fetchTransaction(TRANSACTION_ID);
  console.log(`✅ Approvals: ${Number(approvalCount)}/20`);
}

main().catch(console.error);
