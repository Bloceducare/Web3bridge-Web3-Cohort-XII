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

// Whitelist a single address
async function whitelistAddress(address: string) {
  const { airdrop: airdropAddress } = await getDeployedAddresses();
  const airdrop = await ethers.getContractAt("KemsguyAirdrop", airdropAddress);

  console.log(`Whitelisting address: ${address}`);
  const tx = await airdrop.whitelistAddress(address);
  const receipt = await tx.wait();
  
  if (receipt) {
    console.log(`Address whitelisted successfully! Transaction: ${receipt.hash}`);
  } else {
    console.error("Failed to whitelist address");
  }
  
  return receipt;
}

// Whitelist multiple addresses
async function whitelistAddresses(addresses: string[]) {
  const { airdrop: airdropAddress } = await getDeployedAddresses();
  const airdrop = await ethers.getContractAt("KemsguyAirdrop", airdropAddress);

  console.log(`Whitelisting ${addresses.length} addresses...`);
  const tx = await airdrop.whitelistAddresses(addresses);
  const receipt = await tx.wait();
  
  if (receipt) {
    console.log(`Addresses whitelisted successfully! Transaction: ${receipt.hash}`);
  } else {
    console.error("Failed to whitelist addresses");
  }
  
  return receipt;
}

// Claim airdrop
async function claimAirdrop() {
  const { airdrop: airdropAddress } = await getDeployedAddresses();
  const airdrop = await ethers.getContractAt("KemsguyAirdrop", airdropAddress);

  // Check if can claim
  const [signer] = await ethers.getSigners();
  const canClaim = await airdrop.canClaim(await signer.getAddress());
  
  if (!canClaim) {
    throw new Error("Address not eligible for claim");
  }

  // Claim tokens
  const tx = await airdrop.claimDrop();
  const receipt = await tx.wait();
  
  if (receipt) {
    console.log(`Airdrop claimed successfully! Transaction: ${receipt.hash}`);
  } else {
    console.error("Failed to claim airdrop");
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

    // Example addresses to whitelist
    const addressesToWhitelist = [
      userAddress,
      "0x1234567890123456789012345678901234567890",
      // Add more addresses as needed
    ];

    // Whitelist addresses
    console.log("\nWhitelisting addresses...");
    await whitelistAddresses(addressesToWhitelist);

    // Try to claim airdrop
    console.log("\nClaiming airdrop...");
    await claimAirdrop();

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