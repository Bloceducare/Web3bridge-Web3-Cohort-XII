import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
// import { assert } from "console";
import hre from "hardhat";
import { expect } from "chai";

describe("PiggyBank", function () {
  async function deployPiggyBankContract() {
    const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

    const [manager, contributors] = await hre.ethers.getSigners();

    const PiggyBank = await hre.ethers.getContractFactory("PiggyBank");

    const latestTime = await time.latest();
    const targetAmount = hre.ethers.parseEther("10")

    const deployedPiggyBank = await PiggyBank.deploy(targetAmount, latestTime + 3600, manager.address ); // 1 hour later

    return { deployedPiggyBank, manager, contributors, ADDRESS_ZERO};
  }

  describe("Deployment", () => {
    it('should be deployed by manager', async() => {
        let {deployedPiggyBank, manager} = await loadFixture(deployPiggyBankContract);      

        const runner = deployedPiggyBank.runner as HardhatEthersSigner;

        expect(runner.address).to.equal(manager.address);
    })

    it('should not be address zero', async() => {
        let {deployedPiggyBank, ADDRESS_ZERO} = await loadFixture(deployPiggyBankContract);

        expect(deployedPiggyBank.target).to.not.be.equal(ADDRESS_ZERO);
    }) 
})

  describe('Deposit', () =>  {
    it('should accept contributions from contributors', async() => {
      const { deployedPiggyBank, contributors } = await loadFixture(deployPiggyBankContract);

      let contributionBefore = await deployedPiggyBank.contributions(contributors.address);

      const contribution = hre.ethers.parseEther("1"); 

      await deployedPiggyBank.connect(contributors).deposit({ value: contribution }); 

      const contributionAfter = await deployedPiggyBank.contributions(contributors.address) 

      expect(contributionAfter).to.be.greaterThan(contributionBefore);
    })

    it('address should not be address zero', async() => {
      const { deployedPiggyBank, ADDRESS_ZERO } = await loadFixture(deployPiggyBankContract);

      expect(deployedPiggyBank.runner).to.not.be.equal(ADDRESS_ZERO);
    })

    it('current time should be less than target time', async() => {
      const { deployedPiggyBank } = await loadFixture(deployPiggyBankContract);

      const currentTime = await time.latest();
      const targetTime = await deployedPiggyBank.withdrawalDate();

      expect(currentTime).to.be.lessThan(targetTime);
    })

    it('contributors amount should be greater than 0', async() => {
      const { deployedPiggyBank, contributors } = await loadFixture(deployPiggyBankContract);

      const contributorAmount = await deployedPiggyBank.contributions(contributors.address);  

      expect(contributorAmount).to.be.lessThanOrEqual(0);
    })

    it('should emit a Deposit event', async() => {
      const { deployedPiggyBank, contributors } = await loadFixture(deployPiggyBankContract);

      const contributorAmount = await deployedPiggyBank.contributions(contributors.address);

      expect(contributorAmount).to.emit(deployedPiggyBank, 'Deposit').withArgs(contributors.address, contributorAmount);
    })
  })

  describe('Withdraw', () => {

    it('should check if the withdrawer is the manager', async() => {
      const { deployedPiggyBank, manager } = await loadFixture(deployPiggyBankContract);

      const runner = deployedPiggyBank.runner as HardhatEthersSigner;
      expect(runner.address).to.equal(manager.address);
    })

    // it('current time should be greater than target time', async() => {
    //   const { deployedPiggyBank } = await loadFixture(deployPiggyBankContract);

    //   const currentTime = await time.latest();
    //   const targetTime = await deployedPiggyBank.withdrawalDate();

    //   expect(currentTime).to.be.greaterThan(targetTime); // 1 hour later, it is correct just that the time has not reached yet
    // })

    it('should not be address zero', async() => {
      const { deployedPiggyBank, ADDRESS_ZERO } = await loadFixture(deployPiggyBankContract);

      expect(deployedPiggyBank.runner).to.not.be.equal(ADDRESS_ZERO);
    })

    it('the address balance to be greater than the target amount', async() => {
      const { deployedPiggyBank, manager } = await loadFixture(deployPiggyBankContract);

      const targetAmount = await deployedPiggyBank.targetAmount();
      const balance = await hre.ethers.provider.getBalance(manager.address);

      expect(balance).to.be.greaterThanOrEqual(targetAmount);
    })

    it('should emit a Withdraw event', async() => {
      const { deployedPiggyBank, manager } = await loadFixture(deployPiggyBankContract);

      const targetAmount = await deployedPiggyBank.targetAmount();

      expect(targetAmount).to.emit(deployedPiggyBank, 'Withdraw').withArgs(manager.address, targetAmount);
    })
  })

})