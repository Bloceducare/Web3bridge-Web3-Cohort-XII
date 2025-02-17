import { ethers } from "hardhat";
import { Airdrop } from "../typechain-types"; // Ensure correct import path

// Replace with deployed contract address
const AIRDROP_CONTRACT_ADDRESS = "0x510EDcFD3Ca1622274275aF6D346E8750322C15B"; // Update with actual deployed contract address

// Replace with new Merkle root
const NEW_MERKLE_ROOT = "0xe02a8fafa7e9c6d0ac1548dba4dad65aec9120fb9584b8355fbf0fa635862eb3"; // Update with new Merkle root hash

async function updateMerkleRoot() {
  const [owner] = await ethers.getSigners(); // Get owner wallet

  // ✅ Ensure contract connection includes signer
  const airdropContract = await ethers.getContractAt("Airdrop", AIRDROP_CONTRACT_ADDRESS, owner) as Airdrop;

  console.log(`Updating Merkle root to: ${NEW_MERKLE_ROOT}...`);

  try {
    const tx = await airdropContract.updateMerkleRoot(NEW_MERKLE_ROOT);
    console.log("Transaction sent! Waiting for confirmation...");
    await tx.wait(); // Wait for the transaction to be mined

    console.log("✅ Merkle root updated successfully!");
  } catch (error) {
    console.error("❌ Merkle root update failed:", error);
  }
}

updateMerkleRoot().catch(console.error);
