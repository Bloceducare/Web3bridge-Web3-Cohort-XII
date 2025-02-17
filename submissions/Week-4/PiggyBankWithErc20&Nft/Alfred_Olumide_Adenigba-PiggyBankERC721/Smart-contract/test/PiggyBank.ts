import { time, loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { Block } from "ethers";

describe("PiggyBank Contract", () => {
  const deployPiggyBankContract = async () => {
    const [manager, contributor1, contributor2, stranger] = await hre.ethers.getSigners();
    
    const targetAmount = 5; // Target is 5 tokens
    const withdrawalDate = (await time.latest()) + 86400; // 1 day in the future
    
    // Deploy the ERC20 token mock contract
    const ERC20Mock = await hre.ethers.getContractFactory("MayToken");
    const token = await ERC20Mock.deploy("PiggyToken", "PTK", 1000); // 1000 PTK tokens

    // Transfer tokens to contributors
    await token.transfer(contributor1.address, 100); // Give contributor1 100 tokens
    await token.transfer(contributor2.address, 100); // Give contributor2 100 tokens

    // Deploy the PiggyBankNFT contract
    const PiggyBankNFT = await hre.ethers.getContractFactory("PiggyBankNFT");
    const nft = await PiggyBankNFT.deploy("PiggyBankNFT", "PBNFT");

    // Deploy the PiggyBank contract
    const PiggyBank = await hre.ethers.getContractFactory("PiggyBank");
    const deployPiggyBank = await PiggyBank.deploy(token.target, nft.target, targetAmount, withdrawalDate, manager.address);
    
    // Return all relevant objects for the tests
    return { deployPiggyBank, manager, contributor1, contributor2, stranger, token, nft, targetAmount, withdrawalDate };
  };

  describe("Deployment", () => {
    it("Should deploy PiggyBank correctly", async () => {
      const { deployPiggyBank, manager } = await loadFixture(deployPiggyBankContract);
      expect(await deployPiggyBank.manager()).to.equal(manager.address);
    });

    it("Should deploy ERC20 contract correctly", async () => {
      const { deployPiggyBank, token } = await loadFixture(deployPiggyBankContract);
      expect(await deployPiggyBank.token()).to.equal(token.target);
    });

    it("Should deploy ERC721 contract correctly", async () => {
      const { deployPiggyBank, nft } = await loadFixture(deployPiggyBankContract);
      expect(await deployPiggyBank.nft()).to.equal(nft.target);
    });

    it("should set the correct target amount and withdrawal date", async () => {
      const { deployPiggyBank, targetAmount, withdrawalDate } = await loadFixture(deployPiggyBankContract);
      expect(await deployPiggyBank.targetAmount()).to.equal(targetAmount);
      expect(await deployPiggyBank.withdrawalDate()).to.equal(withdrawalDate);
    });
  });

  describe("Saving and Contribution", () => {
    it("Should allow a user to contribute tokens", async () => {
      const { deployPiggyBank, contributor1, token } = await loadFixture(deployPiggyBankContract);
      
      // Contributor1 approves 2 tokens for the contract
      await token.connect(contributor1).approve(deployPiggyBank.getAddress(), 2);
      
      // Contributor1 contributes 2 tokens
      await expect(deployPiggyBank.connect(contributor1).save(2))
        .to.emit(deployPiggyBank, "Contributed")
    });

    it('should not accept value less than or equal to 0', async () => {
      const { deployPiggyBank, contributor1, token } = await loadFixture(deployPiggyBankContract);
      
      // Contributor1 approves 0 tokens for the contract
      await token.connect(contributor1).approve(deployPiggyBank.getAddress(), 0);
      
      // Contributor1 contributes 0 tokens
      await expect(deployPiggyBank.connect(contributor1).save(0)).to.be.revertedWith('YOU ARE BROKE');
    });


    it("Should mint an NFT after the second contribution", async () => {
      const { deployPiggyBank, contributor1, token, nft } = await loadFixture(deployPiggyBankContract);

      // First contribution
      await token.connect(contributor1).approve(deployPiggyBank.getAddress(), 2);
      await deployPiggyBank.connect(contributor1).save(2);

      // Second contribution
      await token.connect(contributor1).approve(deployPiggyBank.getAddress(), 2);
      const nftMintSpy = await expect(deployPiggyBank.connect(contributor1).save(2))
        .to.emit(deployPiggyBank, "NFTMinted")
        .withArgs(contributor1.address, 1); 

      // Ensure the tokenId matches the minted NFT
      const nftOwner = await nft.ownerOf(1);
      expect(nftOwner).to.equal(contributor1.address);
    });

    it("Should increase contributors count once even after the second contribution", async () => {
      const { deployPiggyBank, contributor1, token, nft } = await loadFixture(deployPiggyBankContract);

      // First contribution
      await token.connect(contributor1).approve(deployPiggyBank.getAddress(), 2);
      await deployPiggyBank.connect(contributor1).save(2);

      // Second contribution
      await token.connect(contributor1).approve(deployPiggyBank.getAddress(), 2);
      const nftMintSpy = await expect(deployPiggyBank.connect(contributor1).save(2))
        .to.emit(deployPiggyBank, "NFTMinted")
        .withArgs(contributor1.address, 1); 

      // Ensure the tokenId matches the minted NFT
      const contributorCount = await deployPiggyBank.contributorsCount();
      expect(contributorCount).to.equal(1);
    });

    it("Should fail if insufficient token allowance for contribution", async () => {
      const { deployPiggyBank, contributor1, token } = await loadFixture(deployPiggyBankContract);
      
      // Contributor1 approves only 1 token for the contract (not enough for 2 tokens)
      await token.connect(contributor1).approve(deployPiggyBank.getAddress(), 1);
      
      // Contributor1 tries to contribute 2 tokens (should fail)
      await expect(deployPiggyBank.connect(contributor1).save(2))
        .to.be.revertedWith("INSUFFICIENT ALLOWANCE");
    });

    it("Should fail if insufficient token balance for contribution", async () => {
      const { deployPiggyBank, contributor1, token } = await loadFixture(deployPiggyBankContract);
      
      // Contributor1 doesn't have enough tokens for 200 tokens
      await expect(deployPiggyBank.connect(contributor1).save(200))
        .to.be.revertedWith("INSUFFICIENT BALANCE");
    });

    it("Should not allow saving after the withdrawal date", async () => {
      const { deployPiggyBank, contributor1, token, withdrawalDate } = await loadFixture(deployPiggyBankContract);
      
      // Move time past the withdrawal date
      await time.increaseTo(withdrawalDate + 86401); // Move 1 second past withdrawal date

      // Contributor tries to contribute after the deadline
      await expect(deployPiggyBank.connect(contributor1).save(2))
        .to.be.revertedWith("YOU CAN NO LONGER SAVE");
    });
  });

  describe("Withdrawals", () => {
    it("Should only allow manager to withdraw after target amount and target time is reached", async () => {
      const { deployPiggyBank, manager, contributor1, token, withdrawalDate } = await loadFixture(deployPiggyBankContract);
      
      // Contributor1 contributes the full target amount (5 tokens)
      await token.connect(contributor1).approve(deployPiggyBank.getAddress(), 5);
      await deployPiggyBank.connect(contributor1).save(5);
      await time.increaseTo(withdrawalDate);

      // Now, the manager should be able to withdraw
      await expect(deployPiggyBank.connect(manager).withdraw()).to.emit(deployPiggyBank, "Withdrawn")
    });

    it("should not allow withdrawal before target date", async () => {
      const { deployPiggyBank, manager, contributor1, token, withdrawalDate } = await loadFixture(deployPiggyBankContract);
      
      // Contributor1 contributes the full target amount (5 tokens)
      await token.connect(contributor1).approve(deployPiggyBank.getAddress(), 5);
      await deployPiggyBank.connect(contributor1).save(5);

      // it should fail even if manager tries to withdraw
      await expect(deployPiggyBank.connect(manager).withdraw()).to.be.revertedWith("NOT YET TIME");
    });

    it("Should fail if the target amount is not reached", async () => {
      const { deployPiggyBank, manager, contributor1, token, withdrawalDate } = await loadFixture(deployPiggyBankContract);
      
      // Contributor1 contributes less than the target amount (only 3 tokens)
      await token.connect(contributor1).approve(deployPiggyBank.getAddress(), 3);
      await deployPiggyBank.connect(contributor1).save(3);
      await time.increaseTo(withdrawalDate);

      // Manager attempts to withdraw before the target amount is reached
      await expect(deployPiggyBank.connect(manager).withdraw())
        .to.be.revertedWith("TARGET AMOUNT NOT REACHED");
    });
  });

  describe("Manager Only Functions", () => {
    it("Should prevent non managers from withdrawing", async () => {
      const { deployPiggyBank, stranger, token } = await loadFixture(deployPiggyBankContract);
      
      // Stranger attempts to withdraw (should fail)
      await expect(deployPiggyBank.connect(stranger).withdraw())
        .to.be.revertedWith("YOU WAN THIEF ABI ?");
    });
  });

  describe("Get Contract Balance", () => {
    it("Should return the correct contract balance", async () => {
      const { deployPiggyBank, contributor1, token } = await loadFixture(deployPiggyBankContract);
      
      // Contributor1 contributes 5 tokens
      await token.connect(contributor1).approve(deployPiggyBank.getAddress(), 5);
      await deployPiggyBank.connect(contributor1).save(5);
      
      // Check the contract's balance
      const balance = await deployPiggyBank.getContractBalance();
      expect(balance).to.equal(5);
    });
  });
});
