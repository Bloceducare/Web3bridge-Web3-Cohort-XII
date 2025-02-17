import { ethers } from "hardhat";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const signers = await ethers.getSigners(); // Get all accounts
  console.log(`🔹 Found ${signers.length} accounts`);

  const FUND_ADDRESS = process.env.FUND_ADDRESS!;
  const TRANSACTION_ID = 0; // Change if needed

  const fund = await ethers.getContractAt("BoardFundManager", FUND_ADDRESS);

  for (let i = 0; i < Math.min(20, signers.length); i++) {
    const signer = signers[i];

    console.log(`🔹 Approving with account: ${signer.address}`);
    const fundWithSigner = fund.connect(signer);

    try {
      const tx = await fundWithSigner.approveTransaction(TRANSACTION_ID);
      await tx.wait();
      console.log(`✅ Approval successful from ${signer.address}: ${tx.hash}`);
    } catch (error: any) {
      console.error(`❌ Approval failed for ${signer.address}:`, error.reason || error);
    }
  }
}

main().catch(console.error);
