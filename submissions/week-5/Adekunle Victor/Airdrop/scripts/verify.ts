import { ethers } from "hardhat";

async function main() {
    // Get the merkle tree setup
    const { merkleTree, root, whitelist } = await require("./merkleRoot").default();
    
    // Get the deployed contract address - replace with your actual address
    const AIRDROP_ADDRESS = "YOUR_DEPLOYED_AIRDROP_CONTRACT_ADDRESS";
    const airdrop = await ethers.getContractAt("Airdrop", AIRDROP_ADDRESS);

    // Verify the root matches
    const contractRoot = await airdrop.merkleRoot();
    console.log("\nVerifying Merkle Root:");
    console.log("Contract Root:", contractRoot);
    console.log("Generated Root:", root);
    console.log("Roots Match:", contractRoot === root);

    // Verify each address
    for (const address of whitelist) {
        console.log(`\nVerifying ${address}:`);
        
        // Generate proof
        const leaf = ethers.keccak256(
            ethers.AbiCoder.defaultAbiCoder().encode(
                ['address'],
                [address]
            )
        );
        const proof = merkleTree.getHexProof(leaf);

        // Check if proof is valid using contract
        const isValid = await airdrop.verifyProof(proof, address);
        console.log("Proof Valid:", isValid);

        // Check if already claimed
        const claimed = await airdrop.claimed(address);
        console.log("Already Claimed:", claimed);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });