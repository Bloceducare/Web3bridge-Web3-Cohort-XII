import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";
import fs from "fs";

async function main() {
  console.log("🔍 Debugging Merkle Tree...");

  // Load whitelist
  const whitelist: Record<string, number> = JSON.parse(fs.readFileSync("scripts/whitelist.json", "utf-8"));
  
  console.log("📝 Whitelist Data:");
  console.table(whitelist);

  // Generate leaves for Merkle Tree
  const leaves = Object.entries(whitelist).map(([addr, amt]) =>
    keccak256(Buffer.from(addr.toLowerCase() + amt.toString())) 
  );

  const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  const merkleRoot = merkleTree.getHexRoot();
  
  console.log("🌳 Computed Merkle Root:", merkleRoot);

  // Check if stored root matches computed root
  const merkleData = JSON.parse(fs.readFileSync("scripts/merkleRoot.json", "utf-8"));
  console.log("📜 Stored Merkle Root in File:", merkleData.merkleRoot);
  
  if (merkleRoot !== merkleData.merkleRoot) {
    console.error("❌ ERROR: Merkle Root Mismatch! Regenerate it.");
    process.exit(1);
  }

  // Debug proof for your address
  const testAddress = "0xAf50C37C8B4534670cfE2099ff205c1a0Df88D3d".toLowerCase();
  const testAmount = whitelist[testAddress];

  if (!testAmount) {
    console.error(`❌ ERROR: Address ${testAddress} not found in whitelist.`);
    process.exit(1);
  }

  const leaf = keccak256(Buffer.from(testAddress + testAmount.toString()));
  const proof = merkleTree.getHexProof(leaf);

  console.log("🛠 Debugging Your Merkle Proof...");
  console.log("🔹 Address:", testAddress);
  console.log("🔹 Amount:", testAmount);
  console.log("🔹 Leaf Hash:", leaf.toString("hex"));
  console.log("🔹 Generated Proof:", proof);

  console.log("✅ Merkle Tree Debug Completed.");
}

main().catch((error) => {
  console.error("❌ Error debugging Merkle Tree:", error);
  process.exit(1);
});
