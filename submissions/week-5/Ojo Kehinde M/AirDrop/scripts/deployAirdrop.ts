import { ethers } from "hardhat";
import { MerkleTree } from 'merkletreejs';
import keccak256 from 'keccak256';

async function main() {
    try {
        console.log("Starting deployment...");

        // Deploy Token contract
        const Token = await ethers.getContractFactory("Token");
        const token = await Token.deploy();
        await token.waitForDeployment();
        const tokenAddress = await token.getAddress();
        console.log("✅ Token deployed at:", tokenAddress);

        // Get deployer's address
        const [deployer] = await ethers.getSigners();
        console.log("Deploying contracts with account:", deployer.address);

        // Whitelist addresses
        const whitelist = [
            { address: "0x3f84410A6cAD617e64c5F66c6bEb90FC61D40A94", amount: ethers.parseEther("100") },
            { address: "0x7b2Cd44240dB84Fa8e13A5fA6673F81C5b2cB7Bf", amount: ethers.parseEther("100") },
            { address: "0xB2CB5D1E5D918447130Ac36ba653fA7d3e2Ac4e5", amount: ethers.parseEther("100") },
        ];

        // Generate Merkle Tree
        const leafNodes = whitelist.map(({ address, amount }) =>
            ethers.solidityPackedKeccak256(
                ['address', 'uint256'],
                [address, amount]
            )
        );

        const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });
        const merkleRoot = merkleTree.getHexRoot();

        console.log("\nMerkle Tree Details:");
        console.log("Merkle Root:", merkleRoot);

        // Generate and log proof for first address
        const firstAddress = whitelist[0].address;
        const firstAmount = whitelist[0].amount;
        const leaf = ethers.solidityPackedKeccak256(
            ['address', 'uint256'],
            [firstAddress, firstAmount]
        );
        const proof = merkleTree.getHexProof(leaf);
        
        console.log("\nSample Proof for", firstAddress);
        console.log("Proof:", proof);

        // Deploy Airdrop contract
        console.log("\nDeploying Airdrop contract...");
        const Airdrop = await ethers.getContractFactory("Airdrop");
        const airdrop = await Airdrop.deploy(merkleRoot, tokenAddress);
        await airdrop.waitForDeployment();
        const airdropAddress = await airdrop.getAddress();
        console.log("✅ Airdrop contract deployed at:", airdropAddress);

        // Transfer tokens to Airdrop contract
        const totalAirdropAmount = ethers.parseEther("1000");
        console.log("\nTransferring tokens to Airdrop contract...");
        
        // First approve the transfer
        const approveTx = await token.approve(airdropAddress, totalAirdropAmount);
        await approveTx.wait();
        console.log("✅ Approved token transfer");

        // Then transfer
        const transferTx = await token.transfer(airdropAddress, totalAirdropAmount);
        await transferTx.wait();
        console.log(`✅ Transferred ${ethers.formatEther(totalAirdropAmount)} tokens to Airdrop contract`);

        // Verify setup
        const contractBalance = await token.balanceOf(airdropAddress);
        console.log("\nFinal Setup Verification:");
        console.log("Airdrop Contract Balance:", ethers.formatEther(contractBalance), "tokens");
        console.log("Merkle Root Set:", await airdrop.merkleRoot());

        // Save deployment info
        console.log("\n📝 Deployment Information:");
        console.log({
            tokenContract: tokenAddress,
            airdropContract: airdropAddress,
            merkleRoot: merkleRoot,
            sampleProof: {
                address: firstAddress,
                amount: ethers.formatEther(firstAmount),
                proof: proof
            }
        });

        console.log("\n🚀 Deployment & Setup Complete!");

    } catch (error) {
        console.error("\n❌ Deployment failed:");
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error(error);
        }
        throw error;
    }
}

main().catch((error) => {
    console.error("❌ Script failed:", error);
    process.exitCode = 1;
});