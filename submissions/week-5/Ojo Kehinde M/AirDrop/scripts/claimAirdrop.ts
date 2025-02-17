import { ethers } from "hardhat";
import { MerkleTree } from 'merkletreejs';
import keccak256 from 'keccak256';

async function main() {
    try {
        // Get the signer
        const [claimer] = await ethers.getSigners();
        const claimerAddress = claimer.address;
        console.log("Claiming with address:", claimerAddress);

        // Contract addresses
        const airdropAddress = "0x8dff69007f7B73DB1D02221e26fB74b0299e1f83";
        const tokenAddress = "0x510EDcFD3Ca1622274275aF6D346E8750322C15B";

        // Get contract instances
        const airdrop = await ethers.getContractAt("Airdrop", airdropAddress);
        const token = await ethers.getContractAt("IERC20", tokenAddress);

        // Check contract token balance
        const contractBalance = await token.balanceOf(airdropAddress);
        console.log("Contract token balance:", ethers.formatEther(contractBalance));
        
        // Check if already claimed
        const claimed = await airdrop.hasClaimed(claimerAddress);
        if (claimed) {
            throw new Error("Address has already claimed");
        }

        // Get current merkle root from contract
        const currentMerkleRoot = await airdrop.merkleRoot();
        console.log("Current merkle root:", currentMerkleRoot);

        // Amount to claim (make sure this matches what's in the Merkle tree)
        const amount = ethers.parseEther("10");

        // Airdrop data (replace with your actual airdrop data)
        const airdropData = [
            {
                address: "0x3f84410A6cAD617e64c5F66c6bEb90FC61D40A94",
                amount: "100"
            },
            // Add other addresses and amounts here
        ];

        // Create Merkle tree
        const leaves = airdropData.map(x => 
            ethers.solidityPackedKeccak256(
                ['address', 'uint256'],
                [x.address, x.amount]
            )
        );
        
        const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
        const root = merkleTree.getHexRoot();
        
        // Verify merkle root matches contract
        if (root !== currentMerkleRoot) {
            console.error("Generated merkle root doesn't match contract's root");
            console.log("Generated root:", root);
            console.log("Contract root:", currentMerkleRoot);
            throw new Error("Merkle root mismatch");
        }

        // Get proof for claimer
        const leaf = ethers.solidityPackedKeccak256(
            ['address', 'uint256'],
            [claimerAddress, amount]
        );
        const proof = merkleTree.getHexProof(leaf);

        console.log("Generated proof:", proof);

        // Verify proof locally before sending transaction
        const isValid = merkleTree.verify(proof, leaf, root);
        if (!isValid) {
            throw new Error("Generated proof is invalid");
        }

        console.log("Submitting claim transaction...");
        
        // Estimate gas with more detailed error handling
        let estimatedGas;
        try {
            estimatedGas = await airdrop.claim.estimateGas(proof, amount);
        } catch (error: any) {
            console.error("Gas estimation failed. This usually means the transaction will fail:");
            console.error(error.message);
            if (error.message.includes("NOTWHITELISTED")) {
                console.error("Your address is not in the whitelist with the correct amount");
            }
            throw error;
        }

        // Submit claim with high gas limit
        const tx = await airdrop.claim(proof, amount, {
            gasLimit: Math.ceil(Number(estimatedGas) * 1.5) // 50% buffer
        });

        console.log("Transaction submitted:", tx.hash);
        console.log("Waiting for confirmation...");

        const receipt = await tx.wait();
        console.log("Transaction confirmed in block:", receipt?.blockNumber);

        // Verify claim was successful
        const balanceAfter = await token.balanceOf(claimerAddress);
        console.log("Balance after claim:", ethers.formatEther(balanceAfter));

    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes("execution reverted")) {
                console.error("\nTransaction reverted. Possible reasons:");
                console.error("1. Your address is not in the whitelist");
                console.error("2. The amount doesn't match what's in the Merkle tree");
                console.error("3. The contract doesn't have enough tokens");
                console.error("4. You've already claimed");
            }
            console.error("\nFull error:", error.message);
        }
        process.exitCode = 1;
    }
}

main().catch((error) => {
    console.error("Script failed:", error);
    process.exitCode = 1;
});