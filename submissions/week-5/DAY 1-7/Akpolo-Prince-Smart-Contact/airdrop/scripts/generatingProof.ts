const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');

// List of whitelisted addresses
const whitelistedAddresses = [
  '0xd2df53D9791e98Db221842Dd085F4144014BBE2a',
  '0x2E15bB8aDF3438F66A6F786679B0bBBBF02A75d5',
  '0x3210607AC8126770E850957cE7373ee7e59e3A29',
  '0xe9002dB3180Ac41f3cF9Fefb59839532624e9014',
];

// Hash addresses to create leaves
const leaves = whitelistedAddresses.map(addr => keccak256(addr));

// Create Merkle Tree
const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });

// Get Merkle Root
const root = merkleTree.getRoot().toString('hex');
console.log('Merkle Root:', `0x${root}`);

// Generate Merkle Proof for an address
const address = '0x3210607AC8126770E850957cE7373ee7e59e3A29'; // Replace with the address you want to generate proof for
const leaf = keccak256(address);
const proof = merkleTree.getHexProof(leaf);
console.log('Merkle Proof for address', address, ':', proof)