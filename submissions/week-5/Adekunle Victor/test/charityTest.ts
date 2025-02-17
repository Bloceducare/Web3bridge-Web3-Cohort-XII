const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("CrowdFunding", function () {
  let crowdFunding;
  let token;
  let owner;
  let creator;
  let contributor1;
  let contributor2;
  
  // Test campaign parameters
  const CAMPAIGN_NAME = "Test Campaign";
  const CAMPAIGN_DESCRIPTION = "Test Description";
  const CAMPAIGN_GOAL = ethers.parseEther("100");
  const CAMPAIGN_DURATION = 7 * 24 * 60 * 60; // 7 days
  
  beforeEach(async function () {
    // Get signers
    [owner, creator, contributor1, contributor2] = await ethers.getSigners();
    
    // Deploy mock ERC20 token
    const MockToken = await ethers.getContractFactory("CharityToken");
    token = await MockToken.deploy("CharityToken", "CRT");
    
    // Deploy CrowdFunding contract
    const CrowdFunding = await ethers.getContractFactory("CrowdFunding");
    crowdFunding = await CrowdFunding.deploy(await token.getAddress());
    
    // Mint tokens to contributors
    const mintAmount = ethers.parseEther("1000");
    await token.mint(contributor1.address, mintAmount);
    await token.mint(contributor2.address, mintAmount);
    
    // Approve crowdfunding contract to spend tokens
    await token.connect(contributor1).approve(await crowdFunding.getAddress(), mintAmount);
    await token.connect(contributor2).approve(await crowdFunding.getAddress(), mintAmount);
  });

  describe("Campaign Creation", function () {
    it("Should create a campaign with valid parameters", async function () {
      const tx = await crowdFunding.connect(creator).createCampaign(
        CAMPAIGN_NAME,
        CAMPAIGN_DESCRIPTION,
        CAMPAIGN_GOAL,
        CAMPAIGN_DURATION
      );

      const campaign = await crowdFunding.campaigns(0);
      expect(campaign.name).to.equal(CAMPAIGN_NAME);
      expect(campaign.goal).to.equal(CAMPAIGN_GOAL);
      expect(campaign.creator).to.equal(creator.address);
      
      await expect(tx)
        .to.emit(crowdFunding, "CampaignCreated")
        .withArgs(0, CAMPAIGN_NAME, CAMPAIGN_GOAL, campaign.deadline, creator.address);
    });

    it("Should revert when creating campaign with zero goal", async function () {
      await expect(
        crowdFunding.connect(creator).createCampaign(
          CAMPAIGN_NAME,
          CAMPAIGN_DESCRIPTION,
          0,
          CAMPAIGN_DURATION
        )
      ).to.be.revertedWithCustomError(crowdFunding, "InvalidContribution");
    });
  });

  describe("Campaign Contributions", function () {
    beforeEach(async function () {
      await crowdFunding.connect(creator).createCampaign(
        CAMPAIGN_NAME,
        CAMPAIGN_DESCRIPTION,
        CAMPAIGN_GOAL,
        CAMPAIGN_DURATION
      );
    });

    it("Should allow valid contributions", async function () {
      const contribution = ethers.parseEther("50");
      
      await expect(crowdFunding.connect(contributor1).contribute(0, contribution))
        .to.emit(crowdFunding, "ContributionMade")
        .withArgs(0, contributor1.address, contribution);

      const campaign = await crowdFunding.campaigns(0);
      expect(campaign.amountRaised).to.equal(contribution);
      
      const contributorBalance = await crowdFunding.campaignContributions(0, contributor1.address);
      expect(contributorBalance).to.equal(contribution);
    });

    it("Should revert when contribution would exceed goal", async function () {
      const contribution = CAMPAIGN_GOAL + 1n;
      
      await expect(
        crowdFunding.connect(contributor1).contribute(0, contribution)
      ).to.be.revertedWithCustomError(crowdFunding, "GoalReached");
    });

    it("Should revert when contributing to expired campaign", async function () {
      await time.increase(CAMPAIGN_DURATION + 1);
      
      await expect(
        crowdFunding.connect(contributor1).contribute(0, ethers.parseEther("50"))
      ).to.be.revertedWithCustomError(crowdFunding, "CampaignEnded");
    });
  });

  describe("Campaign Withdrawal", function () {
    beforeEach(async function () {
      await crowdFunding.connect(creator).createCampaign(
        CAMPAIGN_NAME,
        CAMPAIGN_DESCRIPTION,
        CAMPAIGN_GOAL,
        CAMPAIGN_DURATION
      );
      
      // Fund the campaign to goal
      await crowdFunding.connect(contributor1).contribute(0, CAMPAIGN_GOAL);
    });

    it("Should allow creator to withdraw after successful campaign", async function () {
      await time.increase(CAMPAIGN_DURATION + 1);
      
      await expect(crowdFunding.connect(creator).withdraw(0))
        .to.emit(crowdFunding, "FundsWithdrawn")
        .withArgs(0, CAMPAIGN_GOAL);

      const campaign = await crowdFunding.campaigns(0);
      expect(campaign.withdrawn).to.be.true;
      
      const creatorBalance = await token.balanceOf(creator.address);
      expect(creatorBalance).to.equal(CAMPAIGN_GOAL);
    });

    it("Should revert withdrawal if campaign is still active", async function () {
      await expect(
        crowdFunding.connect(creator).withdraw(0)
      ).to.be.revertedWithCustomError(crowdFunding, "CampaignStillActive");
    });

    it("Should revert withdrawal if caller is not creator", async function () {
      await time.increase(CAMPAIGN_DURATION + 1);
      
      await expect(
        crowdFunding.connect(contributor1).withdraw(0)
      ).to.be.revertedWithCustomError(crowdFunding, "NotTheOwner");
    });
  });

  describe("Refunds", function () {
    beforeEach(async function () {
      await crowdFunding.connect(creator).createCampaign(
        CAMPAIGN_NAME,
        CAMPAIGN_DESCRIPTION,
        CAMPAIGN_GOAL,
        CAMPAIGN_DURATION
      );
      
      // Partial funding
      await crowdFunding.connect(contributor1).contribute(0, ethers.parseEther("40"));
    });

    it("Should allow refund if goal not reached and campaign ended", async function () {
      const contribution = ethers.parseEther("40");
      await time.increase(CAMPAIGN_DURATION + 1);
      
      const initialBalance = await token.balanceOf(contributor1.address);
      
      await expect(crowdFunding.connect(contributor1).refundBackers(0))
        .to.emit(crowdFunding, "RefundIssued")
        .withArgs(0, contributor1.address, contribution);

      const finalBalance = await token.balanceOf(contributor1.address);
      expect(finalBalance - initialBalance).to.equal(contribution);
      
      const contributorBalance = await crowdFunding.campaignContributions(0, contributor1.address);
      expect(contributorBalance).to.equal(0);
    });

    it("Should revert refund if campaign is still active", async function () {
      await expect(
        crowdFunding.connect(contributor1).refundBackers(0)
      ).to.be.revertedWithCustomError(crowdFunding, "CampaignStillActive");
    });

    it("Should revert refund if goal was reached", async function () {
      await crowdFunding.connect(contributor2).contribute(0, ethers.parseEther("60"));
      await time.increase(CAMPAIGN_DURATION + 1);
      
      await expect(
        crowdFunding.connect(contributor1).refundBackers(0)
      ).to.be.revertedWithCustomError(crowdFunding, "GoalReached");
    });

    it("Should revert refund for non-contributors", async function () {
      await time.increase(CAMPAIGN_DURATION + 1);
      
      await expect(
        crowdFunding.connect(contributor2).refundBackers(0)
      ).to.be.revertedWithCustomError(crowdFunding, "NoContribution");
    });
  });
});