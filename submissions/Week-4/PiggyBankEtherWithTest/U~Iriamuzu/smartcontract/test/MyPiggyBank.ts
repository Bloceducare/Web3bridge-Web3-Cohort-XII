import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
// import { assert } from "console";
import hre from "hardhat";
import { expect } from "chai";

describe("MyPiggyBank", function () {
  async function deployPiggyBankContract() {
    const MyPiggyBank = await hre.ethers.getContractFactory("MyPiggyBank");
    const latestTime = await time.latest();
    const deployedPiggyBank = await MyPiggyBank.deploy( latestTime + 3600 ); // 1 hour later

    return { deployedPiggyBank };  
  }

  describe("Deployment", () => {
    it('should be deployed', async() => {
        let {deployedPiggyBank} = await loadFixture(deployPiggyBankContract);      
        expect(deployedPiggyBank).to.not.be.equal(null);
    })
  })
  
  describe("Deposit", () => {
    it('should deposit', async() => {
      let {deployedPiggyBank} = await loadFixture(deployPiggyBankContract);
      let depositAmount = hre.ethers.parseEther("1");
      let depositBefore = await deployedPiggyBank.balance();
      await deployedPiggyBank.deposit({value: depositAmount});
      let depositAfter = await deployedPiggyBank.balance() ;
      expect(depositAfter).to.be.greaterThanOrEqual(depositBefore);
    })
    
    it('deposit amount should be greater than 0', async() => {
      let {deployedPiggyBank} = await loadFixture(deployPiggyBankContract);
      let depositAmount = hre.ethers.parseEther("1");
      let depositBefore = await deployedPiggyBank.balance();
      await deployedPiggyBank.deposit({value: depositAmount});
      let depositAfter = await deployedPiggyBank.balance() ;
      expect(depositAfter).to.be.greaterThanOrEqual(depositBefore);
    })

    it('should emit a Deposit event', async() => {
      const { deployedPiggyBank } = await loadFixture(deployPiggyBankContract);
      const owner = deployedPiggyBank.owner as HardhatEthersSigner;
      const depositAmount = hre.ethers.parseEther("1");
      const balance = await deployedPiggyBank.balance();

      expect(depositAmount).to.emit(deployedPiggyBank, 'Deposit').withArgs(depositAmount, owner.address, balance);
    })
  })

  describe("Withdraw", () => {

    it('should withdraw', async() => {
      let {deployedPiggyBank} = await loadFixture(deployPiggyBankContract);

      let depositAmount = hre.ethers.parseEther("1");

      await deployedPiggyBank.deposit({value: depositAmount});
      let withdrawBefore = await deployedPiggyBank.balance();
      await deployedPiggyBank.withdraw(withdrawBefore);
      let withdrawAfter = await deployedPiggyBank.balance();
      expect(withdrawAfter).to.be.lessThan(withdrawBefore);
    })

    // it('should not withdraw if the time is not up', async() => {
    //   let {deployedPiggyBank} = await loadFixture(deployPiggyBankContract);

    //   const currentTime = await time.latest();
    //   const targetTime = await deployedPiggyBank.unlockTime();

    //   expect(currentTime).to.be.greaterThanOrEqual(targetTime); // the time has not reached yet
    // })

    it('the balance should  be greater than the target amount', async() => {
      let {deployedPiggyBank} = await loadFixture(deployPiggyBankContract);

      const targetAmount = await deployedPiggyBank.targetAmount();
      const balance = await deployedPiggyBank.balance();

      expect(balance).to.be.greaterThanOrEqual(targetAmount);
    })

    it('should emit a Withdraw event', async() => {
      const { deployedPiggyBank } = await loadFixture(deployPiggyBankContract);

      const targetAmount = await deployedPiggyBank.targetAmount();
      const owner = deployedPiggyBank.owner as HardhatEthersSigner;
      const balance = await deployedPiggyBank.balance();

      expect(targetAmount).to.emit(deployedPiggyBank, 'Withdraw').withArgs(targetAmount, owner.address, balance);
    })

  })

})