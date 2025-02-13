import { expect } from "chai"
import hre from "hardhat"
import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";



describe("PiggyBank", () => {
  
  const PiggyBankFixture = async () => {
    let currentDate = await time.latest()
    
    const targetAmount = 10
    const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

    const bank = await hre.ethers.getContractFactory("PiggyBank");
    
    const [ manager, contributor1, contributor2 ] = await hre.ethers.getSigners();
    const zeroSigner = await hre.ethers.getSigner(ZERO_ADDRESS);

    console.log(manager)
    const DeployPiggyBank = await bank.deploy(targetAmount, BigInt(currentDate + 10), manager )

    return { DeployPiggyBank, manager, contributor1, contributor2, ZERO_ADDRESS, currentDate, targetAmount, zeroSigner }
  }
  describe("Deployement",  () => {
    it("it should deploy the contract successfully", async () => {
      
      const { DeployPiggyBank, ZERO_ADDRESS } = await loadFixture(PiggyBankFixture);
      expect(DeployPiggyBank.target).not.equal(ZERO_ADDRESS)
    });

  })
  describe("deposit", () => {
    it("user should make a contrinution", async () => {
      const { DeployPiggyBank, contributor1 } = await  loadFixture(PiggyBankFixture);
      const contributorsCountBefore = Number(await DeployPiggyBank.contributorsCount())
      await DeployPiggyBank.connect(contributor1).save({ value: 1 });
      const contributorsCountAfter = Number(await DeployPiggyBank.contributorsCount())
      expect(contributorsCountAfter).to.equal(contributorsCountBefore + 1)
    });
    it("it should raise an error with YOU ARE BROKE as message", async () => {
      const { DeployPiggyBank, contributor1 } = await loadFixture(PiggyBankFixture);

      await expect(DeployPiggyBank.connect(contributor1).save({value: 0})).to.be.revertedWith("YOU ARE BROKE")
    })
    it("it should raise an error message: YOU CAN NO LONGER SAVE", async () => {
      const { DeployPiggyBank, contributor1 } = await loadFixture(PiggyBankFixture);
      await time.increase(10);

      await expect(DeployPiggyBank.connect(contributor1).save({ value: 1})).to.be.revertedWith("YOU CAN NO LONGER SAVE")
    })

    it("it should raise an error: UNAUTHORIZED ADDRESS if the address is a address(0)", async () => {
      const { DeployPiggyBank, zeroSigner, ZERO_ADDRESS } = await loadFixture(PiggyBankFixture);

      console.log(zeroSigner)

      // await expect(DeployPiggyBank.connect(zeroSigner).save({ value: 1 })).to.be.revertedWith("UNAUTHORIZED ADDRESS")
     
      // connect to the contract with the ZERO_ADDRESS
      // await expect(DeployPiggyBank.connect(ZERO_ADDRESS).save({value: 1 })).to.be.revertedWith("UNAUTHORIZED ADDRESS")
    
    })
    it("it should emit Contributed event when a contributor has sent his contribution", async () => {
      let currentDate = (await time.latest()) + 1
      const { DeployPiggyBank, contributor1 } = await loadFixture(PiggyBankFixture);
      console.log(contributor1.address)

      await expect(DeployPiggyBank.connect(contributor1).save({ value: 1})).to.emit(DeployPiggyBank, "Contributed").withArgs(contributor1, 1, currentDate )

    })
  })
  describe("withdrawal",  () => {
    it("it should raise an error: YOU WAN THIEF ABI ?", async () => {
      const { DeployPiggyBank, contributor1 } = await loadFixture(PiggyBankFixture);

      await expect(DeployPiggyBank.connect(contributor1).withdrawal()).to.be.revertedWith("YOU WAN THIEF ABI ?");
    });
    it("it should raise an error: NOT YET TIME", async () => {
      const { DeployPiggyBank, manager } = await loadFixture(PiggyBankFixture);
      await expect(DeployPiggyBank.connect(manager).withdrawal()).to.be.revertedWith("NOT YET TIME");
    });
    it("it should raise an error: TARGET AMOUNT NOT REACHED", async () => {
      const { DeployPiggyBank, manager, contributor1 } = await loadFixture(PiggyBankFixture);

      await DeployPiggyBank.connect(contributor1).save({value: 2});
      await time.increase(10)
      
      await expect(DeployPiggyBank.connect(manager).withdrawal()).to.be.revertedWith("TARGET AMOUNT NOT REACHED");
    });
    it("it should raise an error: TARGET AMOUNT NOT REACHED", async () => {
      const { DeployPiggyBank, manager, contributor1, targetAmount } = await loadFixture(PiggyBankFixture);
      await DeployPiggyBank.connect(contributor1).save({ value: targetAmount } );
      await time.increase(10)
      await DeployPiggyBank.connect(manager).withdrawal()

      const contractBalanceAfter = await hre.ethers.provider.getBalance(DeployPiggyBank.target)

      expect(contractBalanceAfter).to.equal(0)
    });
    it("it should emit a withdrawn event", async () => {
      const { DeployPiggyBank, manager, contributor1, targetAmount, currentDate } = await loadFixture(PiggyBankFixture);
      await DeployPiggyBank.connect(contributor1).save({ value: targetAmount });
      const contractBalanceBefore = await hre.ethers.provider.getBalance(DeployPiggyBank.target)
  
      await time.increase(10)
      await expect(DeployPiggyBank.connect(manager).withdrawal()).to.emit(DeployPiggyBank, "Withdrawn").withArgs(contractBalanceBefore, currentDate + 13)
    });
    
  })
})
