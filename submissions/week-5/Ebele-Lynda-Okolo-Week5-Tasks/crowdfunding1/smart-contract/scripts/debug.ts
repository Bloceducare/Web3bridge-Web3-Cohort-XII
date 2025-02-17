import { ethers } from "hardhat";

async function main() {
    try {
        console.log("Script starting...");
        
        // Get the signer
        const [signer] = await ethers.getSigners();
        console.log("Using signer address:", await signer.getAddress());
        
        // Get the contract instance
        console.log("Getting contract instance...");
        const crowdfunding = await ethers.getContractAt(
            "Crowdfunding",
            "0x3C121FefDa903DeaDcCB9D09e9e6F4a51aB67673"
        );
        
        console.log("Contract address:", await crowdfunding.getAddress());
        
        // Try to get campaign count
        const count = await crowdfunding.campaignCount();
        console.log("Current campaign count:", count);
        
        console.log("Script completed successfully");
    } catch (error) {
        console.error("An error occurred:");
        console.error(error);
        throw error; // Re-throw to see the full stack trace
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => {
        console.log("Script execution completed");
        process.exit(0);
    })
    .catch((error) => {
        console.error("Script failed:");
        console.error(error);
        process.exit(1);
    });