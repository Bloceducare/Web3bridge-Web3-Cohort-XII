import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";
import fs from "fs";

// List of whitelisted addresses
const whitelist = [
  "0x2c55614E7fC28894F55a7169ce0af42FAFF5E457",
  "0xb216270aFB9DfcD611AFAf785cEB38250863F2C9",
  "0xd755983ba6b8308d2e79Dc35AE2ADcb027467508",
];


const leafNodes = whitelist.map(addr => keccak256(addr));


const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });


const merkleRoot = merkleTree.getHexRoot();
console.log("Merkle Root:", merkleRoot);


const proofs = whitelist.map(address => {
  const leaf = keccak256(address);  
  const proof = merkleTree.getHexProof(leaf);  
  
  return { address, proof };
});


fs.writeFileSync("proofs.json", JSON.stringify(proofs, null, 2), "utf-8");

console.log("Merkle proofs have been saved to proofs.json");
