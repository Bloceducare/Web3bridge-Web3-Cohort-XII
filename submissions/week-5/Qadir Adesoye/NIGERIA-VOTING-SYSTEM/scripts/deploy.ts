import { ethers } from "hardhat";
import { log } from "console";

async function main() {
  try {
    // Election parameters
    const currentTime = Math.floor(Date.now() / 1000);
    const votingStart = currentTime + 60; // Starts in 1 minute
    const votingEnd = votingStart + 3600; // Ends after 1 hour
    const candidates = [1, 2, 3]; // Candidate IDs

    // Get the deployer (the first signer)
    const [deployer] = await ethers.getSigners();

    // Log deployment parameters
    log("\nDeployment Parameters:");
    log("=========================");
    log(`Current Time: ${new Date(currentTime * 1000).toUTCString()}`);
    log(`Voting Start Time: ${new Date(votingStart * 1000).toUTCString()}`);
    log(`Voting End Time: ${new Date(votingEnd * 1000).toUTCString()}`);
    log(`Candidates: ${candidates.join(", ")}`);
    log("=========================\n");

    // Log deployer's address
    log(`Deploying contracts with account: ${deployer.address}`);

    // Get the contract factory
    const VotingSystem = await ethers.getContractFactory("VotingSystem");

    // Deploy the contract
    const votingSystem = await VotingSystem.deploy(votingStart, votingEnd, candidates);

    // Wait for the contract to be deployed
    await votingSystem.waitForDeployment();

    // Log deployment details
    const contractAddress = await votingSystem.getAddress();
    log(`VotingSystem deployed to: ${contractAddress}`);
    log("\nTo verify this contract on Blockscout, use:");
    log(`npx hardhat verify --network lisk_sepolia ${contractAddress} ${votingStart} ${votingEnd} "[${candidates.join(",")}]"`);
  } catch (error) {
    log("\nError Deploying Contract:");
    log("=========================");
    log(`Error: ${(error as Error).message}`);
    log("=========================");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});