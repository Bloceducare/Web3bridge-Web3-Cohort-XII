import { ethers } from "hardhat";
import { MerkleTree } from "merkletreejs";

// Whitelist addresses - you can modify these
const whitelist = [
    "0xCBAb567d0331191450a390E5A97cb5838C356c66",
    "0x3C51be2ee8aEDf216080FB292Ac12d92F90deB2F",
    "0xeFC86ec4812275fa6dC9668Fb86B87df2FEb92ea"
];

// Create leaf node from address
function createLeaf(address: string): string {
    return ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
            ['address'],
            [address]
        )
    );
}

// Generate merkle tree
const leaves = whitelist.map(addr => createLeaf(addr));
const merkleTree = new MerkleTree(leaves, ethers.keccak256, { sortPairs: true });
const merkleRoot = merkleTree.getHexRoot();

// Function to get proof for an address
function getProof(address: string): string[] {
    const leaf = createLeaf(address);
    return merkleTree.getHexProof(leaf);
}

// Log merkle root and proofs
function logMerkleInfo() {
    console.log("Merkle Root:", merkleRoot);
    whitelist.forEach(address => {
        console.log(`\nProof for ${address}:`);
        console.log(getProof(address));
    });
}

// Call logMerkleInfo to log the information
logMerkleInfo();

export {
    whitelist,
    merkleRoot,
    getProof,
    logMerkleInfo
};
