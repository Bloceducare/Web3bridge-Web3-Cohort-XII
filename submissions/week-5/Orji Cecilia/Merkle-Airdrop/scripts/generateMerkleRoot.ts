import { solidityPackedKeccak256 } from "ethers"; // ✅ Correct import for ethers v6
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";
import fs from "fs";

async function main() {
  console.log("🚀 Generating Merkle Root...");

  // Load whitelist
  const whitelist: Record<string, number> = JSON.parse(fs.readFileSync("scripts/whitelist.json", "utf-8"));

  // Generate Merkle Tree leaves using correct encoding for ethers v6
  const leaves = Object.entries(whitelist).map(([address, amount]) =>
    keccak256(Buffer.from(solidityPackedKeccak256(["address", "uint256"], [address, amount]).slice(2), "hex"))
  );

  // Create Merkle Tree
  const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });

  // Get the Merkle Root
  const merkleRoot = merkleTree.getHexRoot();
  console.log(`✅ Merkle Root Generated: ${merkleRoot}`);

  // Save to a JSON file
  fs.writeFileSync("scripts/merkleRoot.json", JSON.stringify({ merkleRoot }));

  console.log("📄 Merkle Root saved to scripts/merkleRoot.json");
}

main().catch((error) => {
  console.error("❌ Error generating Merkle Root:", error);
  process.exit(1);
});
