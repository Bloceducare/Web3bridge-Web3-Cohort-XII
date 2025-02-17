import { ethers, run } from "hardhat";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

async function main() {
  const signers = await ethers.getSigners();
  if (!signers || signers.length === 0) {
    throw new Error("No signers found. Check if you have a valid private key.");
  }
  
  const [deployer] = signers;
  console.log("Deploying contracts with the account:", deployer.address);
  
  const EventContractFactory = await ethers.getContractFactory("EventContract");
  const eventContract = await EventContractFactory.deploy();
  await eventContract.waitForDeployment();
  const contractAddress = await eventContract.getAddress();
  console.log("EventContract deployed to:", contractAddress);

  console.log("Waiting for 10 seconds before verification...");
  await new Promise((resolve) => setTimeout(resolve, 10000));

  if (contractAddress) {
    console.log("Verifying contract...");
    try {
      await run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("Contract verified successfully!");
    } catch (error) {
      console.error("Verification failed:", error);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
