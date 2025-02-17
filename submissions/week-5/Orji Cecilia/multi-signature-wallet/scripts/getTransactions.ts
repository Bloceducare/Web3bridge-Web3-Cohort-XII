import { ethers } from "hardhat";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const FUND_ADDRESS = process.env.FUND_ADDRESS!;
  const fund = await ethers.getContractAt("BoardFundManager", FUND_ADDRESS);

  const transactionCount = await fund.countTransactions();
  console.log(`🔍 Total Transactions: ${transactionCount}`);

  for (let i = 0; i < transactionCount; i++) {
    const [target, amount, payload, executed, approvalCount] = await fund.fetchTransaction(i);

    console.log(`
    🔹 Transaction ID: ${i}
    - Target: ${target}
    - Amount: ${ethers.formatUnits(amount, 18)} tokens
    - Executed: ${executed}
    - Approvals: ${approvalCount}/20
    `);
  }
}

main().catch(console.error);
