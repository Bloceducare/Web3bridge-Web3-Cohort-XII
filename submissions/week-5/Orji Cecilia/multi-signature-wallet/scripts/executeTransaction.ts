import { ethers } from "hardhat";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const [signer] = await ethers.getSigners();
  console.log(`🔹 Executing transaction with account: ${signer.address}`);

  const FUND_ADDRESS = process.env.FUND_ADDRESS!;
  const TRANSACTION_ID = 0;

  const fund = await ethers.getContractAt("BoardFundManager", FUND_ADDRESS, signer);

  console.log("🔹 Executing transaction...");

  try {
    const tx = await fund.runTransaction(TRANSACTION_ID);
    await tx.wait();
    console.log(`✅ Transaction executed: ${tx.hash}`);
  } catch (error: any) {
    console.error("❌ Execution failed:", error.reason || error);
  }
}

main().catch(console.error);
