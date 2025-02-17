import { ethers } from "hardhat";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const [signer] = await ethers.getSigners();
  console.log(`🔹 Depositing ERC20 tokens with account: ${signer.address}`);

  const FUND_ADDRESS = "0x260e686A7D3b40bE4508595710d7D22C7697805b"; // Correct BoardFundManager address
  const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS!;
  const AMOUNT = ethers.parseUnits("100", 18); // Adjust based on token decimals

  // Get contract instances
  const token = await ethers.getContractAt("IERC20", TOKEN_ADDRESS, signer);
  const fund = await ethers.getContractAt("BoardFundManager", FUND_ADDRESS, signer);

  console.log("🔹 Approving contract to spend ERC20 tokens...");
  const approveTx = await token.approve(FUND_ADDRESS, AMOUNT);
  await approveTx.wait();
  console.log(`✅ Approval transaction hash: ${approveTx.hash}`);

  console.log("🔹 Depositing ERC20 tokens into BoardFundManager...");
  const depositTx = await fund.depositFunds(AMOUNT);
  await depositTx.wait();
  console.log(`✅ Deposit successful! Transaction hash: ${depositTx.hash}`);
}

main().catch((error) => {
  console.error("❌ Error depositing funds:", error);
  process.exitCode = 1;
});
