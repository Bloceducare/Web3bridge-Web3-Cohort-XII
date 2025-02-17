import { ethers } from "hardhat";

async function main() {
  console.log("Deploying EventContract...");

  // Deploy EventContract
  const EventContract = await ethers.getContractFactory("EventContract");
  const eventContract = await EventContract.deploy();

  await eventContract.waitForDeployment();
  console.log(`EventContract deployed at: ${eventContract.target}`);
}

// Run the deployment script
main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
