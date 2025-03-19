import { ethers } from "hardhat";
import { Crowdfunding, IERC20 } from "../typechain-types";
import "@nomicfoundation/hardhat-toolbox";

// Contract addresses
const CROWDFUNDING_ADDRESS = "0x3C121FefDa903DeaDcCB9D09e9e6F4a51aB67673";
const TOKEN_ADDRESS = "0x7815F66Cc94Ac6314687850e07F6e24fB5c7f7d4";

async function createCampaign() {
  try {
    console.log("\n--- Creating Campaign ---");
    const crowdfunding = await ethers.getContractAt("Crowdfunding", CROWDFUNDING_ADDRESS) as Crowdfunding;
    
    const targetAmount = ethers.parseEther("100"); // 100 tokens
    const duration = 7 * 24 * 60 * 60; // 7 days in seconds
    const purpose = "My First Campaign";

    console.log("Sending transaction...");
    const tx = await crowdfunding.createCampaign(targetAmount, duration, purpose);
    console.log("Transaction sent:", tx.hash);
    
    console.log("Waiting for confirmation...");
    const receipt = await tx.wait();
    console.log("Transaction confirmed!");
    console.log("Transaction hash:", receipt?.hash);
    
    // Get campaign ID from event logs
    if (receipt && receipt.logs) {
      const iface = crowdfunding.interface;
      const log = receipt.logs.find(
        (log) => log.topics[0] === iface.getEvent("CampaignCreated").topicHash
      );
      if (log) {
        const parsedLog = iface.parseLog({
          topics: log.topics as string[],
          data: log.data
        });
        const campaignId = parsedLog?.args[0];
        console.log("Campaign ID:", campaignId);
        return campaignId;
      }
    }
  } catch (error) {
    console.error("Error creating campaign:", error);
    throw error;
  }
}

async function fundCampaign(campaignId: number = 0) {
  try {
    console.log("\n--- Funding Campaign ---");
    console.log("Campaign ID:", campaignId);
    
    const [backer] = await ethers.getSigners();
    console.log("Backer address:", backer.address);
    
    const crowdfunding = await ethers.getContractAt("Crowdfunding", CROWDFUNDING_ADDRESS) as Crowdfunding;
    const token = await ethers.getContractAt("IERC20", TOKEN_ADDRESS) as IERC20;

    const fundAmount = ethers.parseEther("10"); // 10 tokens
    console.log("Funding amount:", ethers.formatEther(fundAmount), "tokens");

    // Check token balance
    const balance = await token.balanceOf(backer.address);
    console.log("Backer token balance:", ethers.formatEther(balance), "tokens");

    // Approve tokens
    console.log("Approving tokens...");
    const approveTx = await token.connect(backer).approve(CROWDFUNDING_ADDRESS, fundAmount);
    await approveTx.wait();
    console.log("Token approval completed");

    // Fund the campaign
    console.log("Funding campaign...");
    const fundTx = await crowdfunding.connect(backer).fundCampaign(campaignId, fundAmount);
    const receipt = await fundTx.wait();
    console.log("Campaign funded!");
    console.log("Transaction hash:", receipt?.hash);
  } catch (error) {
    console.error("Error funding campaign:", error);
    throw error;
  }
}

async function withdrawFunds(campaignId: number = 0) {
  try {
    console.log("\n--- Withdrawing Funds ---");
    console.log("Campaign ID:", campaignId);
    
    const crowdfunding = await ethers.getContractAt("Crowdfunding", CROWDFUNDING_ADDRESS) as Crowdfunding;
    
    console.log("Sending withdrawal transaction...");
    const tx = await crowdfunding.withdrawFunds(campaignId);
    const receipt = await tx.wait();
    console.log("Funds withdrawn!");
    console.log("Transaction hash:", receipt?.hash);
  } catch (error) {
    console.error("Error withdrawing funds:", error);
    throw error;
  }
}

async function claimRefund(campaignId: number = 0) {
  try {
    console.log("\n--- Claiming Refund ---");
    console.log("Campaign ID:", campaignId);
    
    const [, backer] = await ethers.getSigners();
    const crowdfunding = await ethers.getContractAt("Crowdfunding", CROWDFUNDING_ADDRESS) as Crowdfunding;
    
    console.log("Claiming refund...");
    const tx = await crowdfunding.connect(backer).claimRefund(campaignId);
    const receipt = await tx.wait();
    console.log("Refund claimed!");
    console.log("Transaction hash:", receipt?.hash);
  } catch (error) {
    console.error("Error claiming refund:", error);
    throw error;
  }
}

async function closeCampaign(campaignId: number = 0) {
  try {
    console.log("\n--- Closing Campaign ---");
    console.log("Campaign ID:", campaignId);
    
    const crowdfunding = await ethers.getContractAt("Crowdfunding", CROWDFUNDING_ADDRESS) as Crowdfunding;
    
    console.log("Closing campaign...");
    const tx = await crowdfunding.closeCampaign(campaignId);
    const receipt = await tx.wait();
    console.log("Campaign closed!");
    console.log("Transaction hash:", receipt?.hash);
  } catch (error) {
    console.error("Error closing campaign:", error);
    throw error;
  }
}

async function getCampaignInfo(campaignId: number = 0) {
  try {
    console.log("\n--- Getting Campaign Info ---");
    console.log("Campaign ID:", campaignId);
    
    const crowdfunding = await ethers.getContractAt("Crowdfunding", CROWDFUNDING_ADDRESS) as Crowdfunding;
    const campaign = await crowdfunding.campaigns(campaignId);
    
    console.log({
      creator: campaign.creator,
      targetAmount: ethers.formatEther(campaign.targetAmount) + " tokens",
      deadline: new Date(Number(campaign.deadline) * 1000).toLocaleString(),
      fundsRaised: ethers.formatEther(campaign.fundsRaised) + " tokens",
      purpose: campaign.purpose,
      fundsWithdrawn: campaign.fundsWithdrawn,
      campaignClosed: campaign.campaignClosed
    });
  } catch (error) {
    console.error("Error getting campaign info:", error);
    throw error;
  }
}

async function getContribution(campaignId: number = 0) {
  try {
    console.log("\n--- Getting Contribution Info ---");
    console.log("Campaign ID:", campaignId);
    
    const [, backer] = await ethers.getSigners();
    const crowdfunding = await ethers.getContractAt("Crowdfunding", CROWDFUNDING_ADDRESS) as Crowdfunding;
    
    const contribution = await crowdfunding.contributions(campaignId, backer.address);
    console.log("Contribution amount:", ethers.formatEther(contribution), "tokens");
  } catch (error) {
    console.error("Error getting contribution:", error);
    throw error;
  }
}

async function main() {
  try {
    console.log("Starting Crowdfunding interaction script...");
    
    // Get initial campaign count
    const crowdfunding = await ethers.getContractAt("Crowdfunding", CROWDFUNDING_ADDRESS) as Crowdfunding;
    const count = await crowdfunding.campaignCount();
    console.log("Current campaign count:", count.toString());

    // Create a new campaign
    const campaignId = await createCampaign();
    
    // Get campaign info
    await getCampaignInfo(Number(campaignId));
    
    // Fund the campaign
    await fundCampaign(Number(campaignId));
    
    // Check contribution
    await getContribution(Number(campaignId));
    
    // Get updated campaign info
    await getCampaignInfo(Number(campaignId));
    
    console.log("\nScript execution completed successfully!");
  } catch (error) {
    console.error("Error in main function:", error);
    throw error;
  }
}

// Execute the script
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

// Export functions for individual use
export {
  createCampaign,
  fundCampaign,
  withdrawFunds,
  claimRefund,
  closeCampaign,
  getCampaignInfo,
  getContribution
};