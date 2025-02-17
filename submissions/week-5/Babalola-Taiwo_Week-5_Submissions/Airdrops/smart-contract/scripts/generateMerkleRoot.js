const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');

// Sample whitelist addresses
const whitelist = [
    "0xAbCdEf1234567890aBcDEf1234567890aBcDEf12",
    "0x9876543210FEDCBA9876543210FEDCBA98765432"
];

// Hash the addresses
const leaves = whitelist.map(addr => keccak256(addr));
const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });

// Get Merkle Root
const merkleRoot = merkleTree.getRoot().toString('hex');
console.log("Merkle Root:", "0x" + merkleRoot);

// Generate and log proofs for each address
whitelist.forEach((addr, index) => {
    const leaf = keccak256(addr);
    const proof = merkleTree.getProof(leaf).map(proofNode => proofNode.data.toString('hex'));
    console.log(`Proof for ${addr}:`, proof);
});
