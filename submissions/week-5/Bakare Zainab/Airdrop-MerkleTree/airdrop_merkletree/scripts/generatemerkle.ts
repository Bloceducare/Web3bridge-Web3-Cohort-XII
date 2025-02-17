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
      address: "0xCf692a80814872cea26CF20736E31cBE3123dCd9",
      amount: ethers.parseUnits("0.0000000001", 18).toString()
    },
    {
      address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      amount: ethers.parseUnits("2000", 18).toString()
    }
  ];

  const { root, proofs } = generateMerkleTree(whitelist);
  console.log("Merkle Root:", root);
  console.log("Proofs:", proofs);
}

if (require.main === module) {
  main().catch(console.error);
}







// import {MerkleTree} from 'merkletreejs';
// import keccak256 from 'keccak256'


// const addresses = [
//     "0xCf692a80814872cea26CF20736E31cBE3123dCd9",
//     "0x66f820a414680B5bcda5eECA5dea238543F42054",
//     "0x281055afc982d96fab65b3a49cac8b878184cb16",
//     "0x6f46CF5569aefa1Acc1009290c8e043747172d89",
//     "0xC0ffee254729296a45a3885639AC7E10F9d54979",
//     "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
// ]

// const leaves = addresses.map(addr => keccak256(addr));
// const tree = new MerkleTree(leaves, keccak256);

// const _root = tree.getRoot().toString('hex')
// const root = '0x' + _root;
// console.log("Root:", _root);


// const leaf = keccak256("0xCf692a80814872cea26CF20736E31cBE3123dCd9")
// tree.getProof(leaf)


