const { StandardMerkleTree } = require("@openzeppelin/merkle-tree");
const { ethers } = require("ethers");
const fs = require("fs");

// List of addresses and their allocated tokens
const values = [
    ["0xD3e5A0bF7dB53c97A6F07F0E254fD449Ac85Ff90", ethers.parseUnits("10", 18).toString()],
    ["0xA7b4D9fC2e7b47C9861C3A2E457f9cF0b8D6E7a4", ethers.parseUnits("20", 18).toString()],
    ["0xF9C1e8A3d2B6A5dE4B3C9F7E2D8A6C1F7B5E3D9C", ethers.parseUnits("15", 18).toString()]
];

// Generate the Merkle Tree
const tree = StandardMerkleTree.of(values, ["address", "uint256"]);

// Print the Merkle Root
console.log("Merkle Root:", tree.root);

// Save the tree to a JSON file
fs.writeFileSync("merkleTree.json", JSON.stringify(tree.dump(), null, 2));

console.log("Merkle tree generated and saved to merkleTree.json");

// Function to get a proof for an address
function getProof(address, amount) {
    const savedTree = StandardMerkleTree.load(JSON.parse(fs.readFileSync("merkleTree.json")));

    for (const [i, v] of savedTree.entries()) {
        if (v[0] === address && v[1] === amount) {
            console.log("Proof for", address, ":", savedTree.getProof(i));
            return savedTree.getProof(i);
        }
    }
    console.log("Address not found in Merkle Tree.");
    return null;
}

// Example: Get proof for one of the addresses
getProof("0xD3e5A0bF7dB53c97A6F07F0E254fD449Ac85Ff90", ethers.parseUnits("10", 18).toString());
