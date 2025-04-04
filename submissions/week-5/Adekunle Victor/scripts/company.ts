// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
    try {
        // Get deployer and second signer wallets
        const [deployer, signer2] = await ethers.getSigners();
        console.log("Deploying contracts with account:", deployer.address);
        console.log("Second signer address:", signer2.address);

        // Deploy CompanyToken first
        console.log("\nDeploying CompanyToken...");
        const CompanyToken = await ethers.getContractFactory("CompanyToken");
        const token = await CompanyToken.deploy();
        await token.waitForDeployment();
        console.log("CompanyToken deployed to:", await token.getAddress());

        // Deploy CompanyMultiSigners with 2 signers
        console.log("\nDeploying CompanyMultiSigners...");
        const CompanyMultiSigners = await ethers.getContractFactory("CompanyMultiSigners");
        const multiSig = await CompanyMultiSigners.deploy(
            [deployer.address, signer2.address], // board members
            2, // required signatures
            await token.getAddress()
        );
        await multiSig.waitForDeployment();
        console.log("CompanyMultiSigners deployed to:", await multiSig.getAddress());

        // Fund the multisig contract with tokens
        console.log("\nFunding MultiSig contract with tokens...");
        const fundAmount = ethers.parseEther("1000");
        await token.approve(await multiSig.getAddress(), fundAmount);
        await multiSig.depositFunds(fundAmount);
        console.log("Funded MultiSig with 1000 tokens");

        // Create a test budget
        console.log("\nCreating test budget...");
        const budgetAmount = ethers.parseEther("100");
        const recipient = deployer.address; // Using deployer as recipient for test
        await multiSig.createBudget(
            "Test Budget",
            "First test budget",
            budgetAmount,
            recipient
        );
        console.log("Test budget created");

        // First signature
        console.log("\nSigning budget with first signer...");
        await multiSig.signBudget(0);
        console.log("First signature completed");

        // Second signature
        console.log("\nSigning budget with second signer...");
        await multiSig.connect(signer2).signBudget(0);
        console.log("Second signature completed");

        // Release funds
        console.log("\nReleasing funds...");
        await multiSig.releaseFunds(0);
        console.log("Funds released successfully");

        // Print final balances
        const recipientBalance = await token.balanceOf(recipient);
        console.log("\nFinal recipient balance:", ethers.formatEther(recipientBalance), "tokens");
        const contractBalance = await multiSig.getContractBalance();
        console.log("Final contract balance:", ethers.formatEther(contractBalance), "tokens");

    } catch (error) {
        console.error("Error in deployment script:", error);
        process.exitCode = 1;
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});