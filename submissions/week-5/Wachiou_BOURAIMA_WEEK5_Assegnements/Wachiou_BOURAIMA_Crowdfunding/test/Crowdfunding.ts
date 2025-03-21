import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("Crowdfunding", function () {

  const deployCrowdfundingFixture = async () => {

    const tokenName = "CROWDFUNDING TOKEN"
    const tokenSymbole = "CRT"
    const tokenSuply = hre.ethers.parseEther("1000000")

    const ADDR_ZERO = "0x0000000000000000000000000000000000000000"

    const Token = await hre.ethers.getContractFactory("ERC20Token");
    const DeployedToken = await Token.deploy(tokenName, tokenSymbole, tokenSuply);

    const [owner, creator1, creator2, contributor1, contributor2] = await hre.ethers.getSigners();

    const Crowdfunding = await hre.ethers.getContractFactory("Crowdfunding");
    const Deployedcrowdfunding = await Crowdfunding.deploy(DeployedToken.target);

    return { owner, creator1, creator2, contributor1, contributor2, ADDR_ZERO, Deployedcrowdfunding, DeployedToken};

  };

  describe("Deployment", function () {
    it("Should deploy the contract", async function () {
      const { Deployedcrowdfunding, ADDR_ZERO } = await loadFixture(deployCrowdfundingFixture);
      expect(Deployedcrowdfunding.target).to.not.equal(ADDR_ZERO);
    });
  });

  describe("create a campaign", function () {
    it("Should create a campaign", async function () {
      const deadline = await time.latest() + 86400;
      const { Deployedcrowdfunding, creator1 } = await loadFixture(deployCrowdfundingFixture);
      await Deployedcrowdfunding.connect(creator1).createCampaign("Campaign 1", "Description 1", 100000, deadline);

      expect(await Deployedcrowdfunding.campaignCount()).to.be.equal(1);

    });
    it("it should revert because deadline is less than current time", async function () {
      const deadline = await time.latest() - 86400;
      const { Deployedcrowdfunding, creator1 } = await loadFixture(deployCrowdfundingFixture);
      await expect(Deployedcrowdfunding.connect(creator1).createCampaign("Campaign 1", "Description 1", 100000, deadline)).to.be.revertedWithCustomError(Deployedcrowdfunding, "InvalidDeadline");
    });
  });

  describe("Contribution", function () {
    it("Should contribute to a campaign", async function () {
      const deadline = await time.latest() + 86400;
      const { owner, Deployedcrowdfunding, DeployedToken, creator1, contributor1 } = await loadFixture(deployCrowdfundingFixture);
      await Deployedcrowdfunding.connect(creator1).createCampaign("Campaign 1", "Description 1", 100000, deadline);
      
      await DeployedToken.transfer(contributor1.address, 1000);
      await DeployedToken.connect(contributor1).approve(Deployedcrowdfunding.target, 1000);
      await Deployedcrowdfunding.connect(contributor1).contribute(1, 1000);
      expect(((await Deployedcrowdfunding.campaigns(1)).raisedAmount)).to.be.equal(1000);
    });

    it("it should revert because campaign is not active", async function () {
      const deadline = await time.latest() + 86400;
      const { owner, Deployedcrowdfunding, DeployedToken, creator1, contributor1 } = await loadFixture(deployCrowdfundingFixture);
      await Deployedcrowdfunding.connect(creator1).createCampaign("Campaign 1", "Description 1", 100000, deadline);
      
      await DeployedToken.transfer(contributor1.address, 1000);
      await DeployedToken.connect(contributor1).approve(Deployedcrowdfunding.target, 1000);
      await time.increase(86500)
      await expect(Deployedcrowdfunding.connect(contributor1).contribute(1, 1000)).to.be.revertedWithCustomError(Deployedcrowdfunding, "CrowdfundingClosed");
    });
    it("it should revert because campaign doesn't exist", async function () {
      const deadline = await time.latest() + 86400;
      const { owner, Deployedcrowdfunding, DeployedToken, creator1, contributor1 } = await loadFixture(deployCrowdfundingFixture);
      await Deployedcrowdfunding.connect(creator1).createCampaign("Campaign 1", "Description 1", 100000, deadline);

      await DeployedToken.transfer(contributor1.address, 1000);
      await DeployedToken.connect(contributor1).approve(Deployedcrowdfunding.target, 1000);
      await expect(Deployedcrowdfunding.connect(contributor1).contribute(0, 1000)).to.be.revertedWithCustomError(Deployedcrowdfunding, "CompaignDoesNotExist");
    });

    it("it should revert a contribution et refund the amount to the contributor", async function () {
      const deadline = await time.latest() + 86400;
      const { owner, Deployedcrowdfunding, DeployedToken, creator1, contributor1 } = await loadFixture(deployCrowdfundingFixture);
      await Deployedcrowdfunding.connect(creator1).createCampaign("Campaign 1", "Description 1", 100000, deadline);

      await DeployedToken.transfer(contributor1.address, 1000);
      await DeployedToken.connect(contributor1).approve(Deployedcrowdfunding.target, 1000);
      await Deployedcrowdfunding.connect(contributor1).contribute(1, 1000)
      const raisedAmountBefore = (await Deployedcrowdfunding.campaigns(1)).raisedAmount;

      const raisedAmount = (await Deployedcrowdfunding.campaigns(1));

      console.log(raisedAmount)
  
      await Deployedcrowdfunding.connect(contributor1).reverseContribution(1, 1000);
      const raisedAmountafter = (await Deployedcrowdfunding.campaigns(1)).raisedAmount;
     

      expect(raisedAmountafter).to.be.equal(0);

    });

    it("it should revert when invalid amount", async function () {
      const deadline = await time.latest() + 86400;
      const { owner, Deployedcrowdfunding, DeployedToken, creator1, contributor1 } = await loadFixture(deployCrowdfundingFixture);
      await Deployedcrowdfunding.connect(creator1).createCampaign("Campaign 1", "Description 1", 100000, deadline);

      await DeployedToken.transfer(contributor1.address, 1000);
      await DeployedToken.connect(contributor1).approve(Deployedcrowdfunding.target, 1000);
      await Deployedcrowdfunding.connect(contributor1).contribute(1, 1000)
      const raisedAmountBefore = (await Deployedcrowdfunding.campaigns(1)).raisedAmount;

      console.log(raisedAmountBefore.toString())
     
      
      await expect(Deployedcrowdfunding.connect(contributor1).reverseContribution(1, 10000)).to.be.revertedWithCustomError(Deployedcrowdfunding, "InvalidAmount");

    });
});
describe('withdraw', function () {
  it('should withdraw the funds', async function () {
    const deadline = await time.latest() + 86400;
    const { owner, Deployedcrowdfunding, DeployedToken, creator1, contributor1, contributor2 } = await loadFixture(deployCrowdfundingFixture);
    await Deployedcrowdfunding.connect(creator1).createCampaign("Campaign 1", "Description 1", 100000, deadline);
    await DeployedToken.transfer(contributor1.address, 100000);
    await DeployedToken.connect(contributor1).approve(Deployedcrowdfunding.target, 140000);
    await Deployedcrowdfunding.connect(contributor1).contribute(1, 40000)
    await DeployedToken.transfer(contributor2.address, 100000);
    await DeployedToken.connect(contributor2).approve(Deployedcrowdfunding.target, 160000);
    await Deployedcrowdfunding.connect(contributor2).contribute(1, 60000)
    await time.increase(86500)
    await Deployedcrowdfunding.connect(creator1).withdraw(1);
    expect(await DeployedToken.balanceOf(creator1.address)).to.be.equal(100000);
  });
});
});
