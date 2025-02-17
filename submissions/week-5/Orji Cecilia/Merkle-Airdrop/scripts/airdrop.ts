import { ethers } from "hardhat";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";
import fs from "fs";

async function main() {
  console.log("🚀 Starting Airdrop Claim Process...");

  // Load whitelist & Merkle Root
  const whitelist: Record<string, number> = JSON.parse(fs.readFileSync("scripts/whitelist.json", "utf-8"));
  const merkleData = JSON.parse(fs.readFileSync("scripts/merkleRoot.json", "utf-8"));
  const merkleRoot = merkleData.merkleRoot;

  // Contract Address
  const contractAddress = "0x113b37AF6Ac66FAbcC0d5b0CA2A85D938A422aCF"; // Airdrop contract

  // Get signer (your address)
  const [signer] = await ethers.getSigners();
  const userAddress = signer.address;

  console.log("🔹 User Address:", userAddress);

  // Check if address is whitelisted
  const amount = whitelist[userAddress];
  if (!amount) {
    console.error("❌ Address NOT in whitelist!");
    return;
  }

  console.log("🔹 Eligible for:", amount, "tokens");

  // Generate Merkle Tree and Proof
  const merkleTree = new MerkleTree(
    Object.entries(whitelist).map(([addr, amt]: [string, number]) =>
      keccak256(Buffer.from(addr + amt.toString()))
    ),
    keccak256,
    { sortPairs: true }
  );

  const leaf = keccak256(Buffer.from(userAddress + amount.toString()));
  const proof = merkleTree.getHexProof(leaf);

  console.log("🔹 Merkle Proof:", proof);

  // Get Airdrop Contract
  const airdropContract = await ethers.getContractAt("MerkleAirdrop", contractAddress);

  // Check Merkle Root in Contract
  const contractMerkleRoot = await airdropContract.merkleRoot();
  console.log("🔹 Contract Merkle Root:", contractMerkleRoot);
  console.log("🔹 Local Merkle Root:", merkleRoot);

  if (contractMerkleRoot !== merkleRoot) {
    console.error("❌ ERROR: Merkle Root mismatch! Update contract root first.");
    return;
  }

  // Claim Airdrop
  try {
    console.log(`🚀 Claiming ${amount} tokens for ${userAddress}...`);
    const tx = await airdropContract.claim(amount, proof);
    await tx.wait();
    console.log(`✅ Airdrop claimed successfully! Tx: ${tx.hash}`);
  } catch (error) {
    console.error("❌ Error claiming airdrop:", error);
  }
}

main().catch((error) => {
  console.error("❌ Script error:", error);
  process.exit(1);
});
