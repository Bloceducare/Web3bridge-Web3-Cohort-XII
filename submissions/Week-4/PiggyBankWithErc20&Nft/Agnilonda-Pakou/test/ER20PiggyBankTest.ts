import { expect } from "chai";
import hre from "hardhat";
import { time, loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("PiggyBank - ERC20 Deposits", () => {
  const PiggyBankFixture = async () => {
    let currentDate = await time.latest();
    const targetAmount = 1000;
    const [manager, contributor1, contributor2] = await hre.ethers.getSigners();


    const Token = await hre.ethers.getContractFactory("MyERC20");
    const piggyToken = await Token.deploy("PiggyToken", "PIGGY", 1000000);



    const NFT = await hre.ethers.getContractFactory("MyERC721");
    const piggyNFT = await NFT.deploy("PiggyNFT", "PNFT");



    const PiggyBank = await hre.ethers.getContractFactory("PiggyBank");
    const piggyBank = await PiggyBank.deploy(targetAmount, BigInt(currentDate + 100), manager.address, piggyToken.target, piggyNFT.target);


    return { piggyBank, piggyNFT, piggyToken, manager, contributor1, contributor2, targetAmount, currentDate };
  };

  describe("Deposit ERC20", () => {
    it("should allow users to deposit ERC20 tokens", async () => {
      const { piggyBank, manager, piggyToken, contributor1 } = await loadFixture(PiggyBankFixture);
      await piggyToken.connect(manager).mint(contributor1.address, 1000);
      await piggyToken.connect(contributor1).approve(piggyBank.target, 500);
      await piggyBank.connect(contributor1).save(500);
      expect(await piggyBank.contributions(contributor1.address)).to.equal(500);
    });
    it("it shoule an raise an error: OLE OLE THIEF", async () => {
      const { piggyToken, contributor1 } = await loadFixture(PiggyBankFixture);
      await expect(piggyToken.connect(contributor1).mint(contributor1.address, 1000)).to.be.revertedWith("OLE OLE THIEF");
    })
    it("should reject deposit of 0 tokens", async () => {
      const { piggyBank, manager, piggyToken, contributor1 } = await loadFixture(PiggyBankFixture);
      await piggyToken.connect(manager).mint(contributor1.address, 1000);
      await expect(piggyBank.connect(contributor1).save(0)).to.be.revertedWith("YOU ARE BROKE");
    });


    it("should reject deposit if allowance is insufficient", async () => {
      const { piggyBank, contributor1 } = await loadFixture(PiggyBankFixture);
      await expect(piggyBank.connect(contributor1).save(500)).to.be.revertedWith("INSUFFICIENT ALLOWANCE");
    });

    it("should mint NFT after 2 contributions", async () => {
      const { piggyBank, manager, piggyToken, piggyNFT, contributor1 } = await loadFixture(PiggyBankFixture);
      await piggyToken.connect(manager).mint(contributor1.address, 1000);
      await piggyToken.connect(contributor1).approve(piggyBank.target, 1000);
      await piggyBank.connect(contributor1).save(500);
      await piggyBank.connect(contributor1).save(500);
      await expect(piggyNFT.connect(manager).mint(contributor1.address)).not.equal(0);
    });
  });
  it("it should emit Contributed event when a contributor has sent his contribution", async () => {
    const { piggyBank, manager, piggyToken, contributor1 } = await loadFixture(PiggyBankFixture);
    await piggyToken.connect(manager).mint(contributor1.address, 1000);
    await piggyToken.connect(contributor1).approve(piggyBank.target, 500);
    await expect(piggyBank.connect(contributor1).save(500)).to.emit(piggyBank, "Contributed").withArgs(contributor1, 500, ((await time.latest()) + 1))

  })



  describe("withdrawal", () => {
    it("it should raise an error: YOU WAN THIEF ABI ?", async () => {
      const { piggyBank, manager, piggyToken, contributor1 } = await loadFixture(PiggyBankFixture);

      await expect(piggyBank.connect(contributor1).withdrawal()).to.be.revertedWith("YOU WAN THIEF ABI ?");
    });
    it("it should raise an error: NOT YET TIME", async () => {
      const { piggyBank, manager, piggyToken, contributor1 } = await loadFixture(PiggyBankFixture);
      await expect(piggyBank.connect(manager).withdrawal()).to.be.revertedWith("NOT YET TIME");
    });
    it("it should raise an error: TARGET AMOUNT NOT REACHED", async () => {
      const { piggyBank, piggyToken, manager, contributor1, contributor2 } = await loadFixture(PiggyBankFixture);
      await piggyToken.connect(manager).mint(contributor1.address, 1000);
      await piggyToken.connect(contributor1).approve(piggyBank.target, 500);
      await piggyBank.connect(contributor1).save(500);
      // await piggyBank.connect(contributor2).save(500);
      await time.increase(100)
      await expect(piggyBank.connect(manager).withdrawal()).to.be.revertedWith("TARGET AMOUNT NOT REACHED");
    });
    it("it should withdraw money", async () => {
      const { piggyBank, manager, piggyToken, contributor2, contributor1 } = await loadFixture(PiggyBankFixture);
      await piggyToken.connect(manager).mint(contributor1.address, 1000);
      await piggyToken.connect(manager).mint(contributor2.address, 1000);
      await piggyToken.connect(contributor1).approve(piggyBank.target, 1000);
      await piggyToken.connect(contributor2).approve(piggyBank.target, 500);
      await piggyBank.connect(contributor2).save(300);
      await piggyBank.connect(contributor1).save(1000);
      await time.increase(100)
      await piggyBank.connect(manager).withdrawal()

      const contractBalanceAfter = await piggyToken.connect(manager).balanceOf(piggyBank.target)

      expect(contractBalanceAfter).to.equal(0)
    });
    it("it should emit a withdrawn event", async () => {
      const { piggyBank, manager, piggyToken, contributor1 } = await loadFixture(PiggyBankFixture);
      await piggyToken.connect(manager).mint(contributor1.address, 1000);
      await piggyToken.connect(contributor1).approve(piggyBank.target, 1000);
      await piggyBank.connect(contributor1).save(1000)
      const contractBalanceBefore = await piggyToken.connect(manager).balanceOf(piggyBank.target)

      await time.increase(100)
      await expect(piggyBank.connect(manager).withdrawal()).to.emit(piggyBank, "Withdrawn").withArgs(contractBalanceBefore, (await time.latest()) + 1)
    });

  })
});