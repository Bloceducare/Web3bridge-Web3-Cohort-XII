const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");

// Whitelist addresses and amounts
const whitelist = [
  { address: "0x564268FbC519C6bD202C877f6fbc9F2068d3BF53", amount: 10000 },
  { address: "0x564268FbC519C6bD202C877f6fbc9F2068d3BF53", amount: 20000 },
  { address: "0x564268FbC519C6bD202C877f6fbc9F2068d3BF53", amount: 20000 },
  { address: "0x564268FbC519C6bD202C877f6fbc9F2068d3BF53", amount: 20000 },
  { address: "0x564268FbC519C6bD202C877f6fbc9F2068d3BF53", amount: 20000 },
  { address: "0x564268FbC519C6bD202C877f6fbc9F2068d3BF53", amount: 20000 },
  { address: "0x564268FbC519C6bD202C877f6fbc9F2068d3BF53", amount: 20000 },
  { address: "0x564268FbC519C6bD202C877f6fbc9F2068d3BF53", amount: 20000 },
  { address: "0x564268FbC519C6bD202C877f6fbc9F2068d3BF53", amount: 20000 },
  { address: "0x564268FbC519C6bD202C877f6fbc9F2068d3BF53", amount: 20000 },
  // Add more addresses and amounts here
];

// Hash leaves
const leaves = whitelist.map((x) =>
  keccak256(Buffer.concat([Buffer.from(x.address.replace("0x", ""), "hex"), Buffer.from(x.amount.toString())]))
);

// Create Merkle tree
const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
const root = tree.getRoot().toString("hex");

console.log("Merkle Root:", root);