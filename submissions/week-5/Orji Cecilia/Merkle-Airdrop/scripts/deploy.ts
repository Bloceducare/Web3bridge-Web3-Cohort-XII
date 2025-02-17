import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying CisToken...");

  const CisToken = await ethers.getContractFactory("CisToken");
  const token = await CisToken.deploy(); 

  await token.waitForDeployment(); // Wait for the contract to be deployed

  const contractAddress = await token.getAddress();
  console.log(`✅ CisToken deployed to: ${contractAddress}`);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exit(1);
});
