const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');

// List of whitelisted addresses
const whitelistedAddresses = [
  '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4',
  '0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2',
  '0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db',
  '0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB',
];

// Hash addresses to create leaves
const leaves = whitelistedAddresses.map(addr => keccak256(addr));

// Create Merkle Tree
const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });

// Get Merkle Root
const root = merkleTree.getRoot().toString('hex');
console.log('Merkle Root:', `0x${root}`);

// Generate Merkle Proof for an address
const address = '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4'; // Replace with the address you want to generate proof for
const leaf = keccak256(address);
const proof = merkleTree.getHexProof(leaf);
console.log('Merkle Proof for address', address, ':', proof);

// [0x999bf57501565dbd2fdcea36efa2b9aef8340a8901e3459f4a4c926275d36cdb,0x4726e4102af77216b09ccd94f40daa10531c87c4d60bba7f3b3faf5ff9f19b3c]