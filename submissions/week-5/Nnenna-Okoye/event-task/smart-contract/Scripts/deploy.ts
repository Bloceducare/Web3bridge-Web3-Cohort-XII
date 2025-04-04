import { ethers, run } from "hardhat";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  // Get the signer (deployer)
  const [deployer] = await ethers.getSigners();
  if (!deployer) {
    throw new Error("No signers found. Make sure Hardhat is configured correctly.");
  }

  console.log("Deploying contracts with the account:", await deployer.getAddress());

  // Get contract factory
  const EventManagement = await ethers.getContractFactory("EventManagement");
  
  // Deploy contract
  const eventContract = await EventManagement.deploy();
  await eventContract.waitForDeployment();
  
  const contractAddress = await eventContract.getAddress();
  console.log("EventManagement deployed to:", contractAddress);

 // Verify the contract after deployment
 if (contractAddress) {
    console.log("Verifying contract...");
    try {
      await run("verify:verify", {
        address: contractAddress,
        constructorArguments: [], // Add constructor arguments if any
      });
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