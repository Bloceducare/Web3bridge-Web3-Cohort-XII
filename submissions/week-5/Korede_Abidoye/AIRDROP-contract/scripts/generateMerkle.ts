import { MerkleTree } from 'merkletreejs';
import keccak256 from 'keccak256';
import { ethers } from 'ethers';

interface WhitelistEntry {
  address: string;
  amount: string; // in wei
}

export function generateMerkleTree(whitelist: WhitelistEntry[]): {
  root: string;
  proofs: { [address: string]: { proof: string[]; amount: string } }
} {
  // Create leaves
  const leaves = whitelist.map(entry => {
    return keccak256(
      Buffer.from(
        ethers.solidityPacked(
          ['address', 'uint256'],
          [entry.address, entry.amount]
        ).slice(2),
        'hex'
      )
    );
  });

  // Create tree
  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  const root = tree.getHexRoot();

  // Generate proofs
  const proofs: { [address: string]: { proof: string[]; amount: string } } = {};
  whitelist.forEach(entry => {
    const leaf = keccak256(
      Buffer.from(
        ethers.solidityPacked(
          ['address', 'uint256'],
          [entry.address, entry.amount]
        ).slice(2),
        'hex'
      )
    );
    proofs[entry.address] = {
      proof: tree.getHexProof(leaf),
      amount: entry.amount
    };
  });

  return { root, proofs };
}

// Example usage
async function main() {
  const whitelist: WhitelistEntry[] = [
    {
      address: "0xA7CD28a9E07b32600686089ff2FC3BEdb564c2D9",
      amount: ethers.parseUnits("10", 18).toString()
    },
    {
      address: "0x292873caD6027188f6eBecAFb49c623775925Ab4",
      amount: ethers.parseUnits("10", 18).toString()
    }
  ];

  const { root, proofs } = generateMerkleTree(whitelist);
  console.log("Merkle Root:", root);
  console.log("Proofs:", proofs);
}

if (require.main === module) {
  main().catch(console.error);
}