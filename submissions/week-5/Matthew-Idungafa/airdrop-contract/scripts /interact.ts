// scripts/interact.ts
import { ethers } from "hardhat";
import fs from "fs";

// Utility function to get deployed addresses
async function getDeployedAddresses() {
  const network = process.env.HARDHAT_NETWORK || "hardhat";
  const deploymentPath = `./deployments/${network}.json`;
  
  if (!fs.existsSync(deploymentPath)) {
    throw new Error(`No deployment found for network ${network}`);
  }
  
  return JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
}

// Get whitelist data
function getWhitelistData() {
  const whitelistPath = "./merkle/whitelist.json";
  if (!fs.existsSync(whitelistPath)) {
    throw new Error("Whitelist data not found. Run merkleTree.ts first.");
  }
  return JSON.parse(fs.readFileSync(whitelistPath, "utf8"));
}

// Claim airdrop
async function claimAirdrop(userAddress: string) {
  const { airdrop: airdropAddress } = await getDeployedAddresses();
  const whitelistData = getWhitelistData();

  // Get user's proof
  const userData = whitelistData.whitelist[userAddress];
  if (!userData) {
    throw new Error(`Address ${userAddress} not in whitelist`);
  }

  const airdrop = await ethers.getContractAt("KemsguyAirdrop", airdropAddress);

  // Check if address is eligible
  const isEligible = await airdrop.isEligible(userAddress, userData.proof);
  if (!isEligible) {
    throw new Error(`Address ${userAddress} not eligible for airdrop`);
  }

  // Claim tokens
  const tx = await airdrop.claimDrop(userData.proof);
  const receipt = await tx.wait();
  
  if (receipt) {
    console.log(`Airdrop claimed successfully! Transaction: ${receipt.hash}`);
  } else {
    console.error("Failed to claim airdrop");
  }
  
  return receipt;
}

// Update merkle root
async function updateMerkleRoot(newAddresses: string[]) {
  const { airdrop: airdropAddress } = await getDeployedAddresses();
  const airdrop = await ethers.getContractAt("KemsguyAirdrop", airdropAddress);

  // Generate new merkle tree
  const { generateMerkleTree } = require("./merkleTree");
  const merkleTree = generateMerkleTree(newAddresses);
  const newRoot = '0x' + merkleTree.getRoot().toString('hex');

  // Update root in contract
  const tx = await airdrop.updateMerkleRoot(newRoot);
  const receipt = await tx.wait();
  
  if (receipt) {
    console.log(`Merkle root updated successfully! Transaction: ${receipt.hash}`);
    console.log(`New root: ${newRoot}`);
  } else {
    console.error("Failed to update merkle root");
  }
  
  return receipt;
}

// Main function to run interactions
async function main() {
  try {
    // Get the first signer's address
    const [signer] = await ethers.getSigners();
    const userAddress = await signer.getAddress();

    console.log(`Using address: ${userAddress}`);

    // Try to claim airdrop
    console.log("\nClaiming airdrop...");
    await claimAirdrop(userAddress);

    // Example of updating merkle root with new addresses
    console.log("\nUpdating merkle root...");
    const newAddresses = [
      userAddress,
      "0x1234567890123456789012345678901234567890",
      // Add more addresses as needed
    ];
    await updateMerkleRoot(newAddresses);

  } catch (error) {
    console.error("Error:", error);
    process.exitCode = 1;
  }
}

// Execute if running this script directly
if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}