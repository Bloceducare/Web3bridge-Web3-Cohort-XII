import { ethers } from "hardhat";
import fs from "fs";
import { network } from "hardhat";

async function main() {
  try {
    console.log("Starting deployment process...");

    // Deploy Suspect Token first
    console.log("\nDeploying Suspect Token...");
    const SuspectToken = await ethers.getContractFactory("Suspect");
    const suspectToken = await SuspectToken.deploy();
    await suspectToken.waitForDeployment();
    const tokenAddress = await suspectToken.getAddress();
    console.log(`Suspect Token deployed to: ${tokenAddress}`);

    // Generate merkle root - for testing, we'll use a placeholder
    const merkleRoot = "0x29c08bc8bf7d3a0ed4b1dd16063389608cf9dec220f1584e32d317c2041e1fa4";

    // Deploy MerkleAirdrop
    console.log("\nDeploying MerkleAirdrop...");
    const MerkleAirdrop = await ethers.getContractFactory("MerkleAirdrop");
    const merkleAirdrop = await MerkleAirdrop.deploy(tokenAddress, merkleRoot);
    await merkleAirdrop.waitForDeployment();
    const airdropAddress = await merkleAirdrop.getAddress();
    console.log(`MerkleAirdrop deployed to: ${airdropAddress}`);

    // Fund the airdrop contract with tokens
    console.log("\nFunding airdrop contract with tokens...");
    const fundAmount = ethers.parseEther("10000"); // Adjust this amount as needed
    await suspectToken.transfer(airdropAddress, fundAmount);
    console.log(`Transferred ${ethers.formatEther(fundAmount)} tokens to airdrop contract`);

    // Save deployment addresses
    const deployments = {
      suspectToken: tokenAddress,
      merkleAirdrop: airdropAddress,
      timestamp: new Date().toISOString()
    };

    const deploymentsDir = "./deployments";
    if (!fs.existsSync(deploymentsDir)){
      fs.mkdirSync(deploymentsDir);
    }

    fs.writeFileSync(
      `${deploymentsDir}/${network.name}.json`,
      JSON.stringify(deployments, null, 2)
    );

    console.log("\nDeployment completed successfully!");
  } catch (error) {
    console.error("Deployment failed:", error);
    throw error;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});