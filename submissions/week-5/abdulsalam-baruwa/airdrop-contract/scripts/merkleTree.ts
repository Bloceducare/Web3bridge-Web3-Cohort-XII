const {MerkleTree} = require("merkletreejs");
const keccak256 = require("keccak256");
const whitelist = ['0x2c55614E7fC28894F55a7169ce0af42FAFF5E457','0x237720b754a923E05CF3fe26A2DB36BCCb3fB170'];
const leaves = whitelist.map(addr => keccak256(addr));
const merkleTree = new MerkleTree(leaves, keccak256, {sortPairs: true});
const rootHash = merkleTree.getRoot().toString('hex');
console.log(`Whitelist Merkle Root: 0x${rootHash}`);
whitelist.forEach((address) => {
  const proof =  merkleTree.getHexProof(keccak256(address));
  console.log(`Adddress: ${address} Proof: ${proof}`);
});