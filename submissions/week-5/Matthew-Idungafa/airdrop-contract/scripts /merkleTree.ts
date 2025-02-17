import { ethers } from "hardhat";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";
import fs from "fs";

export interface WhitelistAddress {
  address: string;
}

export function generateMerkleTree(addresses: string[]) {
  // Create leaf nodes from addresses
  const leafNodes = addresses.map(addr => 
    keccak256(ethers.solidityPacked(['address'], [addr]))
  );

  // Create Merkle Tree
  const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });
  const rootHash = merkleTree.getRoot();

  // Generate proofs for each address
  const proofs = addresses.map(address => {
    const leaf = keccak256(ethers.solidityPacked(['address'], [address]));
    return merkleTree.getHexProof(leaf);
  });

  // Create whitelist data
  const whitelistData = addresses.reduce((acc, addr, index) => {
    acc[addr] = {
      address: addr,
      proof: proofs[index]
    };
    return acc;
  }, {} as Record<string, { address: string; proof: string[] }>);

  // Save whitelist data to file
  const merkleData = {
    root: '0x' + rootHash.toString('hex'),
    whitelist: whitelistData
  };

  if (!fs.existsSync('./merkle')){
    fs.mkdirSync('./merkle');
  }

  fs.writeFileSync(
    './merkle/whitelist.json',
    JSON.stringify(merkleData, null, 2)
  );

  return merkleTree;
}

// For testing/development
export const testAddresses = [
  "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
  // Add more addresses as needed
];

if (require.main === module) {
  console.log("Generating Merkle tree for test addresses...");
  const tree = generateMerkleTree(testAddresses);
  console.log("Merkle root:", '0x' + tree.getRoot().toString('hex'));
  console.log("Whitelist data saved to ./merkle/whitelist.json");
}