import { ethers } from "hardhat";

async function main() {
    const tokenAddress: string = "0xA3AdaE788c8803Bf764Cf8C4AA298a829bA8ae30";
    const ownerAddress: string = "0x2c55614E7fC28894F55a7169ce0af42FAFF5E457";

    // Ensure Merkle root is properly formatted as bytes32
    const merkleRoot: string = "0x4769664c5c5f3636bf7f1cc959f33a6185f0445f752668a494beda0227a337d7";

    console.log(`Deploying MerkleAirdrop with Merkle Root: ${merkleRoot}`);

    const MerkleAirdrop = await ethers.getContractFactory("MerkleAirdrop");
    const merkleAirdrop = await MerkleAirdrop.deploy(tokenAddress, ownerAddress, merkleRoot);

    await merkleAirdrop.waitForDeployment();
    const contractAddress = await merkleAirdrop.getAddress();

    console.log(`MerkleAirdrop deployed at: ${contractAddress}`);
}

main().catch((error) => {
    console.error("Deployment failed:", error);
    process.exitCode = 1;
});
