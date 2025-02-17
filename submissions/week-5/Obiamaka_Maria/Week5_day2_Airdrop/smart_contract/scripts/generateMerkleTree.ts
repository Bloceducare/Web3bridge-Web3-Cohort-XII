import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";
import { ethers } from "ethers";
import * as fs from "fs";

interface WhitelistEntry {
  address: string;
  amount: number;
}

// Define the whitelisted addresses and their reward amounts
const whitelist: WhitelistEntry[] = [
  { address: "0x536f7190ca407227d16FeeEe7b894dD6301c0871", amount: 100 },
  { address: "0x295d07155cc738e05f52db11fA12F290d4f0c65D", amount: 200 },
 
];

// Generate leaf nodes (hashed user data)
const leaves = whitelist.map(({ address, amount }) =>
  keccak256(ethers.solidityPacked(["address", "uint256"], [address, amount]))
);

const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });

// Get the root hash (store this on-chain)
const merkleRoot: string = merkleTree.getHexRoot();

// Generate proofs for each user
const proofs = whitelist.map(({ address, amount }) => ({
  address,
  proof: merkleTree.getHexProof(
    keccak256(ethers.solidityPacked(["address", "uint256"], [address, amount]))
  ),
}));

// Save data to a JSON file
fs.writeFileSync("merkleData.json", JSON.stringify({ merkleRoot, proofs }, null, 2));

console.log("Merkle Root:", merkleRoot);
console.log("Merkle Proofs generated successfully!");