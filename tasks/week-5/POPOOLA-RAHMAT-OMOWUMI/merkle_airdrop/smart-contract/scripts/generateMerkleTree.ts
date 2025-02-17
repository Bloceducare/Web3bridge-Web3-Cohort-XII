import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";

// List of whitelisted addresses
const whitelist = [
  "0x2c55614E7fC28894F55a7169ce0af42FAFF5E457",
  "0xb216270aFB9DfcD611AFAf785cEB38250863F2C9",
  "0xd755983ba6b8308d2e79Dc35AE2ADcb027467508",
];

// Convert each address to a hash
const leafNodes = whitelist.map(addr => keccak256(addr));
const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });

// Get the Merkle Root
const merkleRoot = merkleTree.getHexRoot();

console.log("Merkle Root:", merkleRoot);
