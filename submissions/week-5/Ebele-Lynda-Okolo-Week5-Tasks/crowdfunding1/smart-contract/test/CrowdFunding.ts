import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { Crowdfunding, TestToken } from "../typechain-types";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("Crowdfunding", function () {
    let crowdfunding: Crowdfunding;
    let token: TestToken;
    let owner: SignerWithAddress;
    let creator: SignerWithAddress;
    let backer1: SignerWithAddress;
    let backer2: SignerWithAddress;
    let campaignId: number;

    // Test campaign parameters
    const testCampaign = {
        targetAmount: ethers.parseEther("100"),
        duration: 7 * 24 * 60 * 60, // 7 days in seconds
        purpose: "Test Campaign"
    };

    beforeEach(async function () {
        // Get signers
        [owner, creator, backer1, backer2] = await ethers.getSigners();

        // Deploy test ERC20 token
        const TestToken = await ethers.getContractFactory("TestToken"); // You'll need to create this
        token = await TestToken.deploy();
        await token.waitForDeployment();

        // Deploy Crowdfunding contract
        const CrowdfundingFactory = await ethers.getContractFactory("Crowdfunding");
        crowdfunding = await CrowdfundingFactory.deploy(await token.getAddress());
        await crowdfunding.waitForDeployment();

        // Mint tokens for backers
        await token.mint(backer1.address, ethers.parseEther("1000"));
        await token.mint(backer2.address, ethers.parseEther("1000"));
    });

    describe("Campaign Creation", function () {
        it("Should create a campaign successfully", async function () {
            const tx = await crowdfunding.createCampaign(
                testCampaign.targetAmount,
                testCampaign.duration,
                testCampaign.purpose
            );

            const receipt = await tx.wait();
            expect(receipt?.status).to.equal(1);

            const campaign = await crowdfunding.campaigns(0);
            expect(campaign.creator).to.equal(owner.address);
            expect(campaign.targetAmount).to.equal(testCampaign.targetAmount);
            expect(campaign.purpose).to.equal(testCampaign.purpose);
        });

        it("Should fail if duration is 0", async function () {
            await expect(
                crowdfunding.createCampaign(testCampaign.targetAmount, 0, testCampaign.purpose)
            ).to.be.revertedWithCustomError(crowdfunding, "DeadlinePassed");
        });
    });

    describe("Campaign Funding", function () {
        beforeEach(async function () {
            await crowdfunding.createCampaign(
                testCampaign.targetAmount,
                testCampaign.duration,
                testCampaign.purpose
            );
            campaignId = 0;

            // Approve token spending
            await token.connect(backer1).approve(
                await crowdfunding.getAddress(),
                ethers.parseEther("1000")
            );
            await token.connect(backer2).approve(
                await crowdfunding.getAddress(),
                ethers.parseEther("1000")
            );
        });

        it("Should fund a campaign successfully", async function () {
            const fundAmount = ethers.parseEther("50");
            await crowdfunding.connect(backer1).fundCampaign(campaignId, fundAmount);

            const campaign = await crowdfunding.campaigns(campaignId);
            expect(campaign.fundsRaised).to.equal(fundAmount);

            const contribution = await crowdfunding.contributions(campaignId, backer1.address);
            expect(contribution).to.equal(fundAmount);
        });

        it("Should close campaign when target is reached", async function () {
            const fundAmount = testCampaign.targetAmount;
            await crowdfunding.connect(backer1).fundCampaign(campaignId, fundAmount);

            const campaign = await crowdfunding.campaigns(campaignId);
            expect(campaign.campaignClosed).to.be.true;
        });

        it("Should fail if campaign is closed", async function () {
            await crowdfunding.connect(backer1).fundCampaign(campaignId, testCampaign.targetAmount);
            
            await expect(
                crowdfunding.connect(backer2).fundCampaign(campaignId, ethers.parseEther("10"))
            ).to.be.revertedWithCustomError(crowdfunding, "CampaignAlreadyClosed");
        });

        it("Should fail if deadline has passed", async function () {
            await time.increase(testCampaign.duration + 1);
            
            await expect(
                crowdfunding.connect(backer1).fundCampaign(campaignId, ethers.parseEther("50"))
            ).to.be.revertedWithCustomError(crowdfunding, "CampaignNotActive");
        });
    });

    describe("Withdrawals", function () {
        beforeEach(async function () {
            await crowdfunding.connect(creator).createCampaign(
                testCampaign.targetAmount,
                testCampaign.duration,
                testCampaign.purpose
            );
            campaignId = 0;

            await token.connect(backer1).approve(
                await crowdfunding.getAddress(),
                testCampaign.targetAmount
            );
        });

        it("Should allow creator to withdraw when target is reached", async function () {
            await crowdfunding.connect(backer1).fundCampaign(campaignId, testCampaign.targetAmount);
            
            await crowdfunding.connect(creator).withdrawFunds(campaignId);
            
            const campaign = await crowdfunding.campaigns(campaignId);
            expect(campaign.fundsWithdrawn).to.be.true;
            
            const creatorBalance = await token.balanceOf(creator.address);
            expect(creatorBalance).to.equal(testCampaign.targetAmount);
        });

        it("Should fail if target not reached", async function () {
            await crowdfunding.connect(backer1).fundCampaign(
                campaignId,
                testCampaign.targetAmount / 2n
            );
            
            await expect(
                crowdfunding.connect(creator).withdrawFunds(campaignId)
            ).to.be.revertedWithCustomError(crowdfunding, "TargetNotReached");
        });

        it("Should fail if not creator", async function () {
            await crowdfunding.connect(backer1).fundCampaign(campaignId, testCampaign.targetAmount);
            
            await expect(
                crowdfunding.connect(backer1).withdrawFunds(campaignId)
            ).to.be.revertedWithCustomError(crowdfunding, "OnlyCreator");
        });
    });

    describe("Refunds", function () {
        beforeEach(async function () {
            await crowdfunding.createCampaign(
                testCampaign.targetAmount,
                testCampaign.duration,
                testCampaign.purpose
            );
            campaignId = 0;

            await token.connect(backer1).approve(
                await crowdfunding.getAddress(),
                ethers.parseEther("50")
            );
        });

        it("Should allow refund if campaign fails", async function () {
            const fundAmount = ethers.parseEther("50");
            await crowdfunding.connect(backer1).fundCampaign(campaignId, fundAmount);
            
            await time.increase(testCampaign.duration + 1);
            
            await crowdfunding.connect(backer1).claimRefund(campaignId);
            
            const contribution = await crowdfunding.contributions(campaignId, backer1.address);
            expect(contribution).to.equal(0);
            
            const backerBalance = await token.balanceOf(backer1.address);
            expect(backerBalance).to.equal(ethers.parseEther("1000"));
        });

        it("Should fail if campaign is still active", async function () {
            await crowdfunding.connect(backer1).fundCampaign(campaignId, ethers.parseEther("50"));
            
            await expect(
                crowdfunding.connect(backer1).claimRefund(campaignId)
            ).to.be.revertedWithCustomError(crowdfunding, "CampaignNotActive");
        });

        it("Should fail if target was reached", async function () {
            await token.connect(backer1).approve(
                await crowdfunding.getAddress(),
                testCampaign.targetAmount
            );
            await crowdfunding.connect(backer1).fundCampaign(campaignId, testCampaign.targetAmount);
            
            await time.increase(testCampaign.duration + 1);
            
            await expect(
                crowdfunding.connect(backer1).claimRefund(campaignId)
            ).to.be.revertedWithCustomError(crowdfunding, "NoFundsToRefund");
        });
    });

    describe("Campaign Management", function () {
        beforeEach(async function () {
            await crowdfunding.connect(creator).createCampaign(
                testCampaign.targetAmount,
                testCampaign.duration,
                testCampaign.purpose
            );
            campaignId = 0;
        });

        it("Should close campaign successfully", async function () {
            await crowdfunding.connect(creator).closeCampaign(campaignId);
            
            const campaign = await crowdfunding.campaigns(campaignId);
            expect(campaign.campaignClosed).to.be.true;
        });

        it("Should fail to close if not creator", async function () {
            await expect(
                crowdfunding.connect(backer1).closeCampaign(campaignId)
            ).to.be.revertedWithCustomError(crowdfunding, "OnlyCreator");
        });
    });
});