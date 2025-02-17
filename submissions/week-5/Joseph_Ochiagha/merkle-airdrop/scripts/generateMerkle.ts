import { ethers } from "ethers";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";
import fs from "fs";

interface WhitelistEntry {
  address: string;
  amount: string;
}

// Read whitelist
const whitelist: WhitelistEntry[] = JSON.parse(
  fs.readFileSync("whitelist.json", "utf8")
);

function generateMerkleTree() {
  try {
    // Create leaf nodes
    const leaves = whitelist.map((entry) =>
      ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["address", "uint256"],
          [entry.address, ethers.parseEther(entry.amount)]
        )
      )
    );

    // Create Merkle tree
    const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    const root = merkleTree.getHexRoot();

    // Generate proofs for each address
    const proofs = whitelist.map((entry, index) => ({
      address: entry.address,
      amount: entry.amount,
      proof: merkleTree.getHexProof(leaves[index]),
    }));

    // Save merkle root
    fs.writeFileSync("merkleRoot.json", JSON.stringify({ root }, null, 2));

    // Save proofs
    fs.writeFileSync("proofs.json", JSON.stringify(proofs, null, 2));

    console.log("Merkle root:", root);
    console.log("Proofs generated successfully!");

    return { root, proofs };
  } catch (error) {
    console.error("Error generating Merkle tree:", error);
    throw error;
  }
}
