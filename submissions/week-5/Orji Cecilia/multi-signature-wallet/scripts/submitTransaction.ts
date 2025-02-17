import { ethers } from "hardhat";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const [signer] = await ethers.getSigners();
  console.log(`🔹 Submitting transaction with account: ${signer.address}`);

  const FUND_ADDRESS = process.env.FUND_ADDRESS!;
  const RECIPIENT = process.env.RECIPIENT_ADDRESS!;
  const AMOUNT = ethers.parseUnits("50", 18); 
  const PAYLOAD = "0x"; 

  if (!FUND_ADDRESS || !RECIPIENT) {
    throw new Error("❌ FUND_ADDRESS or RECIPIENT_ADDRESS is missing in .env file!");
  }

  const fund = await ethers.getContractAt("BoardFundManager", FUND_ADDRESS, signer);

  console.log(`🔹 Adding transaction to send ${ethers.formatUnits(AMOUNT, 18)} tokens to ${RECIPIENT}...`);
  const tx = await fund.addTransaction(RECIPIENT, AMOUNT, PAYLOAD);
  await tx.wait();
  console.log(`✅ Transaction submitted: ${tx.hash}`);
}

main().catch((error) => {
  console.error("❌ Error submitting transaction:", error);
  process.exitCode = 1;
});
