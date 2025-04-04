import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("PiggyBank", () => {
  async function piggyBankFixture() {

    // PiggyBank parameters
    const TARGET_AMOUNT = hre.ethers.parseEther("10");
    const ONE_MONTH = 86400 * 30; // 30 days in seconds
    const WITHDRAWAL_DATE = (await time.latest()) + ONE_MONTH;
    const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
    
    // Signers
    const [owner,manager, contributor1, contributor2] = await hre.ethers.getSigners();

    // Deploy ERC20 token
    const Suspect = await hre.ethers.getContractFactory("Suspect");
    const erc20 = await Suspect.deploy();

    // Deploy NFT
    const SuspectNFT = await hre.ethers.getContractFactory("SuspectNFT");
    const nft = await SuspectNFT.deploy();

    // Deploy PiggyBank
    const Piggy = await hre.ethers.getContractFactory("PiggyBank");
    const piggy = await Piggy.deploy(TARGET_AMOUNT, WITHDRAWAL_DATE, manager.address, erc20.target, nft.target);

    // transfer some tokens to contributors for testing
    const transferAmount = hre.ethers.parseEther("100");
    await erc20.transfer(contributor1.address, transferAmount);
    await erc20.transfer(contributor2.address, transferAmount);

    // Approve PiggyBank to spend tokens
    await erc20.connect(contributor1).approve(piggy.target, transferAmount);
    await erc20.connect(contributor2).approve(piggy.target, transferAmount);

    return {piggy, erc20, nft,owner, manager, contributor1, contributor2, WITHDRAWAL_DATE, TARGET_AMOUNT, ZERO_ADDRESS, ONE_MONTH};
  }

  describe("Deployment", () => {
    it("Should set all parameters correctly", async () => {
      const { piggy, manager, WITHDRAWAL_DATE, TARGET_AMOUNT } = await loadFixture(piggyBankFixture);

      expect(await piggy.withdrawalDate()).to.equal(WITHDRAWAL_DATE);
      expect(await piggy.targetAmount()).to.equal(TARGET_AMOUNT);
      expect(await piggy.manager()).to.equal(manager.address);
    });

    it("Should revert if withdrawal date is in the past", async () => {
      const { erc20, nft, manager } = await loadFixture(piggyBankFixture);
      const Piggy = await hre.ethers.getContractFactory("PiggyBank");
      const pastDate = (await time.latest()) - 86400; // Yesterday

      expect(Piggy.deploy(hre.ethers.parseEther("10"), pastDate, manager.address, erc20.target, nft.target))
        .to.be.revertedWith("WITHDRAWAL MUST BE IN FUTURE");
    });
  });

  describe("Saving ERC20 tokens", () => {
    it("Should not allow zero contributions", async () => {
      const { piggy, contributor1 } = await loadFixture(piggyBankFixture);

      expect(piggy.connect(contributor1).save(0))
        .to.be.revertedWith("YOU ARE BROKE");
    });

    it("Should not allow saving after withdrawal date", async () => {
      const { piggy, contributor1, ONE_MONTH } = await loadFixture(piggyBankFixture);

      await time.increase(ONE_MONTH + 1);

      expect(piggy.connect(contributor1).save(hre.ethers.parseEther("1.0")))
        .to.be.revertedWith("YOU CAN NO LONGER SAVE");
    });

    it("Should transfer ERC20 tokens", async () => {
      const { piggy, erc20, contributor1 } = await loadFixture(piggyBankFixture);
      const saveAmount = hre.ethers.parseEther("1.0");

      await (piggy.connect(contributor1).save(saveAmount));

      expect(await erc20.balanceOf(piggy.target)).to.equal(saveAmount);
      expect(await piggy.contributions(contributor1.address)).to.equal(saveAmount);
      expect(await piggy.contributionCount(contributor1.address)).to.equal(1);
    });

    it("Should increment contributors count for new contributors", async () => {
      const { piggy, contributor1, contributor2 } = await loadFixture(piggyBankFixture);
      const amount = hre.ethers.parseEther("1.0");

      expect(await piggy.contributorsCount()).to.equal(0);
      
      await piggy.connect(contributor1).save(amount);
      expect(await piggy.contributorsCount()).to.equal(1);
      
      await piggy.connect(contributor2).save(amount);
      expect(await piggy.contributorsCount()).to.equal(2);
      
      // Second contribution from same user shouldn't increase count
      await piggy.connect(contributor1).save(amount);
      expect(await piggy.contributorsCount()).to.equal(2);
    });

    it("Should mint NFT after second contribution", async () => {
      const { piggy, contributor1 } = await loadFixture(piggyBankFixture);
      const amount = hre.ethers.parseEther("1.0");

      // First contribution - no NFT
      await piggy.connect(contributor1).save(amount);
      
      // Second contribution - should mint NFT
      expect(piggy.connect(contributor1).save(amount)).to.emit(piggy, "NFTMinted")
        .withArgs(contributor1.address, 0, await time.latest());
    });

    it("Should not allow contributions from zero address", async () => {
      const { piggy, ZERO_ADDRESS } = await loadFixture(piggyBankFixture);
      const amount = hre.ethers.parseEther("1.0");

      // This test might need modification depending on how you're handling zero address transactions
      expect(piggy.save(amount)).to.be.revertedWith("UNAUTHORIZED ADDRESS");
    });
  });

  describe("Withdrawing tokens", () => {
    it("Should only allow manager to withdraw", async () => {
      const { piggy, contributor1, ONE_MONTH } = await loadFixture(piggyBankFixture);
      
      await time.increase(ONE_MONTH + 1);
      
      expect(piggy.connect(contributor1).withdrawal()).to.be.revertedWith("Only manager can call this function");
    });

    it("Should not allow withdrawal before withdrawal date", async () => {
      const { piggy, manager } = await loadFixture(piggyBankFixture);

    expect(piggy.connect(manager).withdrawal()).to.be.revertedWith("NOT YET TIME");
    });

    it("Should not allow withdrawal with zero balance", async () => {
      const { piggy, manager, ONE_MONTH } = await loadFixture(piggyBankFixture);
      
      await time.increase(ONE_MONTH + 1);

      expect(piggy.connect(manager).withdrawal()).to.be.revertedWith("No funds to withdraw");
    });

    it("Should successfully withdraw all tokens after withdrawal date", async () => {
      const { piggy, erc20, manager, contributor1, ONE_MONTH } = await loadFixture(piggyBankFixture);
      const amount = hre.ethers.parseEther("1.0");

      // send tokens
      await piggy.connect(contributor1).save(amount);
      
      // Move time forward
      await time.increase(ONE_MONTH + 1);
      
      // Withdraw
      await (piggy.connect(manager).withdrawal());

      // Check balance of manager to match amount contributed
      expect(await erc20.balanceOf(manager.address)).to.equal(amount);
    });
  });
});