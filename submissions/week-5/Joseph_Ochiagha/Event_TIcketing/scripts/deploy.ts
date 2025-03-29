import { ethers, run } from "hardhat";
import { vars } from "hardhat/config";

const ETHERSCAN_API_KEY = vars.get("ETHERSCAN_API_KEY");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const EventContractFactory = await ethers.getContractFactory("EventContract");
  const eventContract = await EventContractFactory.deploy();
  await eventContract.waitForDeployment();
  const contractAddress = await eventContract.getAddress();
  console.log("EventContract deployed to:", contractAddress);

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
