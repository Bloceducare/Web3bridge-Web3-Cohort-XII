const hre = require("hardhat");
const { ethers } = require("hardhat");

// Configuration
const CAMPAIGN_NAME = "Test Campaign";
const CAMPAIGN_DESCRIPTION = "A test crowdfunding campaign";
const CAMPAIGN_GOAL = ethers.parseEther("100");
const CAMPAIGN_DURATION = 7 * 24 * 60 * 60; // 7 days in seconds

async function main() {
    // Deploy Mock Token
    async function deployMockToken() {
        console.log("Deploying CharityToken...");
        const MockToken = await ethers.getContractFactory("CharityToken");
        const token = await MockToken.deploy("CharityToken", "CRT");
        await token.waitForDeployment();
        console.log("CharityToken deployed to:", await token.getAddress());
        return token;
    }

    // Deploy CrowdFunding
    async function deployCrowdFunding(tokenAddress) {
        console.log("Deploying CrowdFunding...");
        const CrowdFunding = await ethers.getContractFactory("CrowdFunding");
        const crowdFunding = await CrowdFunding.deploy(tokenAddress);
        await crowdFunding.waitForDeployment();
        console.log("CrowdFunding deployed to:", await crowdFunding.getAddress());
        return crowdFunding;
    }

    // Create Campaign
    async function createCampaign(crowdFunding) {
        console.log("\nCreating campaign...");
        const tx = await crowdFunding.createCampaign(
            CAMPAIGN_NAME,
            CAMPAIGN_DESCRIPTION,
            CAMPAIGN_GOAL,
            CAMPAIGN_DURATION
        );
        await tx.wait();
        console.log("Campaign created successfully!");
        
        // Get campaign details
        const campaign = await crowdFunding.campaigns(0);
        console.log("\nCampaign Details:");
        console.log("Name:", campaign.name);
        console.log("Goal:", ethers.formatEther(campaign.goal), "tokens");
        console.log("Deadline:", new Date(Number(campaign.deadline) * 1000).toLocaleString());
        console.log("Creator:", campaign.creator);
    }

    // Contribute to Campaign
    async function contributeToCampaign(token, crowdFunding, amount, campaignId) {
        console.log("\nContributing to campaign...");
        const [_, contributor] = await ethers.getSigners();
        
        // Mint tokens to contributor
        const mintTx = await token.mint(contributor.address, amount);
        await mintTx.wait();
        console.log("Tokens minted to contributor");

        // Approve tokens
        const approveTx = await token.connect(contributor).approve(await crowdFunding.getAddress(), amount);
        await approveTx.wait();
        console.log("Tokens approved");

        // Contribute
        const contributeTx = await crowdFunding.connect(contributor).contribute(campaignId, amount);
        await contributeTx.wait();
        console.log("Contribution successful!");
        
        // Get updated campaign details
        const campaign = await crowdFunding.campaigns(campaignId);
        console.log("Amount raised:", ethers.formatEther(campaign.amountRaised), "tokens");
    }

    // Withdraw Campaign Funds
    async function withdrawCampaignFunds(crowdFunding, campaignId) {
        console.log("\nWithdrawing campaign funds...");
        try {
            const tx = await crowdFunding.withdraw(campaignId);
            await tx.wait();
            console.log("Funds withdrawn successfully!");
            
            // Get campaign details
            const campaign = await crowdFunding.campaigns(campaignId);
            console.log("Withdrawn status:", campaign.withdrawn);
        } catch (error) {
            console.log("Withdrawal failed:", error.message);
        }
    }

    // Request Refund
    async function requestRefund(crowdFunding, campaignId) {
        console.log("\nRequesting refund...");
        try {
            const [_, contributor] = await ethers.getSigners();
            const tx = await crowdFunding.connect(contributor).refundBackers(campaignId);
            await tx.wait();
            console.log("Refund processed successfully!");
            
            // Get contribution amount after refund
            const contribution = await crowdFunding.campaignContributions(campaignId, contributor.address);
            console.log("Remaining contribution:", ethers.formatEther(contribution), "tokens");
        } catch (error) {
            console.log("Refund failed:", error.message);
        }
    }

    // Helper function to increase time
    async function increaseTime(seconds) {
        await ethers.provider.send("evm_increaseTime", [seconds]);
        await ethers.provider.send("evm_mine");
        console.log(`Increased time by ${seconds} seconds`);
    }

    // Example usage of all functions
    async function runExample() {
        // Deploy contracts
        const token = await deployMockToken();
        const crowdFunding = await deployCrowdFunding(await token.getAddress());

        // Create a campaign
        await createCampaign(crowdFunding);

        // Contribute to campaign
        const contributionAmount = ethers.parseEther("50");
        await contributeToCampaign(token, crowdFunding, contributionAmount, 0);

        // Simulate time passing
        console.log("\nSimulating time passage...");
        await increaseTime(CAMPAIGN_DURATION + 1);

        // Try to withdraw (will fail if goal not reached)
        await withdrawCampaignFunds(crowdFunding, 0);

        // Try to get refund
        await requestRefund(crowdFunding, 0);
    }

    // Run the example
    await runExample();
}

// Execute the script
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });