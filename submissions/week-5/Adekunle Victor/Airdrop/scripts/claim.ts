import { ethers } from "hardhat";
import { whitelist, getProof } from "./merkleRoot";
import fs from 'fs';
import { log } from "console";

async function main() {
    // Read deployment info
    const deploymentInfo = JSON.parse(fs.readFileSync('deployment-info.json', 'utf8'));
    console.log("Using deployment info:", deploymentInfo);

    // Get contract instances
    const airdrop = await ethers.getContractAt("Airdrop", deploymentInfo.airdropAddress);
    const token = await ethers.getContractAt("DripToken", deploymentInfo.tokenAddress);

    // Process claims
    for (const address of whitelist) {
        console.log(`\nProcessing claim for ${address}...`);
        
        try {
            // Check if already claimed
            const claimed = await airdrop.claimed(address);
            if (claimed) {
                console.log(`Address ${address} has already claimed`);
                continue;
            }

            // Get proof for address
            const proof = getProof(address);
            console.log(proof);
            
            // Get initial balance
            const initialBalance = await token.balanceOf(address);
            
            // Execute claim
            console.log("Submitting claim transaction...");
            const tx = await airdrop.claim(proof);
            console.log("Waiting for transaction confirmation...");
            await tx.wait();
            
            // Get new balance
            const newBalance = await token.balanceOf(address);
            
            console.log("Claim successful!");
            console.log("Initial balance:", ethers.formatEther(initialBalance), "tokens");
            console.log("New balance:", ethers.formatEther(newBalance), "tokens");
            
        } catch (error) {
            console.error(`Error claiming for ${address}:`, error.message);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error("Script error:", error);
        process.exit(1);
    });