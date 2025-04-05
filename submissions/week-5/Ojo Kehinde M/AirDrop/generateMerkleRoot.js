const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');

// 📝 Replace this with your whitelisted addresses and their airdrop amounts
const whitelist = [
    { address: "0x3f84410A6cAD617e64c5F66c6bEb90FC61D40A94", amount: 100 },
    { address: "0x7b2Cd44240dB84Fa8e13A5fA6673F81C5b2cB7Bf", amount: 300 },
    { address: "0xB2CB5D1E5D918447130Ac36ba653fA7d3e2Ac4e5", amount: 400 },
];

// 🔹 Step 1: Hash each address + amount
const leafNodes = whitelist.map(({ address, amount }) =>
    keccak256(Buffer.from(`${address}${amount}`))
);

// 🔹 Step 2: Generate the Merkle Tree
const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });

// 🔹 Step 3: Get the Merkle Root
const merkleRoot = merkleTree.getRoot().toString('hex');

console.log("Merkle Root:", merkleRoot);

// 🔹 Step 4: Generate Proofs for Each Address (For verification later)
whitelist.forEach(({ address, amount }, index) => {
    const proof = merkleTree.getProof(leafNodes[index]).map(x => x.data.toString('hex'));
    console.log(`Proof for ${address}:`, proof);
});




