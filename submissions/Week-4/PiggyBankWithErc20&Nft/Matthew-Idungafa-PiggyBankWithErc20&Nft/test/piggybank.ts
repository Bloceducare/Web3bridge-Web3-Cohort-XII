import { time, loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre, { ethers } from "hardhat";

describe("PiggyBank Contract", () => {
  // Convert address to lowercase for consistent comparison
  const DEPLOYED_TOKEN_ADDRESS = "0xcde04203314146d133389e7abb29311df156f683".toLowerCase();

  const deployPiggyBankFixture = async () => {
    const [manager, contributor1, contributor2, stranger] = await hre.ethers.getSigners();
    
    // Get the existing token contract
    const token = await ethers.getContractAt("IERC20Custom", DEPLOYED_TOKEN_ADDRESS);
    
    // Deploy NFT Contract
    const NFT = await ethers.getContractFactory("OurERC721");
    const nftContract = await NFT.deploy("Test NFT", "TNFT");
    await nftContract.waitForDeployment();
    const nftAddress = await nftContract.getAddress();
    
    const targetAmount = ethers.parseEther("5");
    const withdrawalDate = await time.latest() + 172800; // 2 days from now
    
    // Deploy PiggyBank
    const PiggyBank = await ethers.getContractFactory("OurPiggyBank");
    const piggyBank = await PiggyBank.deploy(
      targetAmount,
      withdrawalDate,
      manager.address,
      DEPLOYED_TOKEN_ADDRESS,
      nftAddress
    );
    await piggyBank.waitForDeployment();

    return { 
      piggyBank, 
      token, 
      nftContract,
      manager, 
      contributor1, 
      contributor2, 
      stranger, 
      targetAmount, 
      withdrawalDate 
    };
  };

  describe("Deployment", () => {
    it("should set the correct initial values", async () => {
      const { piggyBank, manager, targetAmount, withdrawalDate, nftContract } = 
        await loadFixture(deployPiggyBankFixture);
      
      const piggyBankAddress = await piggyBank.getAddress();
      const nftAddress = await nftContract.getAddress();
      
      expect(await piggyBank.targetAmount()).to.equal(targetAmount);
      expect(await piggyBank.withdrawalDate()).to.equal(withdrawalDate);
      expect(await piggyBank.manager()).to.equal(manager.address);
      expect((await piggyBank.cxii()).toLowerCase()).to.equal(DEPLOYED_TOKEN_ADDRESS);
      expect(await piggyBank.nftContract()).to.equal(nftAddress);
      expect(await piggyBank.contributorsCount()).to.equal(0);
    });
  });

  describe("Contributions", () => {
    it("should reject zero amount contributions", async () => {
      const { piggyBank, contributor1 } = await loadFixture(deployPiggyBankFixture);
      await expect(piggyBank.connect(contributor1).save(0))
        .to.be.revertedWith("YOU ARE BROKE");
    });

    it("should reject contributions after withdrawal date", async () => {
      const { piggyBank, contributor1, withdrawalDate } = 
        await loadFixture(deployPiggyBankFixture);
      
      await time.increaseTo(withdrawalDate + 1);
      
      await expect(piggyBank.connect(contributor1).save(ethers.parseEther("1")))
        .to.be.revertedWith("YOU CAN NO LONGER SAVE");
    });

    it("should track contribution count correctly", async () => {
      const { piggyBank, contributor1 } = await loadFixture(deployPiggyBankFixture);
      expect(await piggyBank.contributionCount(contributor1.address)).to.equal(0);
      expect(await piggyBank.hasNFT(contributor1.address)).to.be.false;
    });
  });

  describe("Withdrawals", () => {
    it("should prevent early withdrawal", async () => {
      const { piggyBank, manager } = await loadFixture(deployPiggyBankFixture);
      await expect(piggyBank.connect(manager).withdrawal())
        .to.be.revertedWith("NOT YET TIME");
    });

    it("should prevent non-manager withdrawal", async () => {
      const { piggyBank, contributor1, withdrawalDate } = 
        await loadFixture(deployPiggyBankFixture);
      
      await time.increaseTo(withdrawalDate);
      
      await expect(piggyBank.connect(contributor1).withdrawal())
        .to.be.revertedWith("YOU WAN THIEF ABI ?");
    });

    it("should require target amount for withdrawal", async () => {
      const { piggyBank, manager, withdrawalDate } = 
        await loadFixture(deployPiggyBankFixture);

      await time.increaseTo(withdrawalDate);
      
      await expect(piggyBank.connect(manager).withdrawal())
        .to.be.revertedWithCustomError(piggyBank, "TargetAmountNotReached");
    });
  });
});