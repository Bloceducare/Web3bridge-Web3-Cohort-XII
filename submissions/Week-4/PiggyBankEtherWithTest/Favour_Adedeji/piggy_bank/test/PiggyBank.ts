import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("Piggy Bank Test", () => {
  const deployPiggyBank =  async () => {
    const [owner, manager, account1, account2] = await hre.ethers.getSigners()
    const PiggyBankContract = await hre.ethers.getContractFactory("PiggyBank")
    const targetAmount = hre.ethers.parseEther("1.0")
    const deployedPiggyBankContract = await PiggyBankContract.deploy(targetAmount, 1739512800, manager)

    const TWO_WEEKS_TIME_IN_SECS = 14 * 24 * 60 * 60;
    const futureTime = (await time.latest()) + TWO_WEEKS_TIME_IN_SECS

    return { deployedPiggyBankContract, owner, manager, account1, account2, targetAmount, futureTime}
  }

  describe("Deployment", () => {
    it("should test if the address passed during initialization is set as the manager", async () => {
      const { deployedPiggyBankContract, manager } = await loadFixture(deployPiggyBank)
      const contractManager = await deployedPiggyBankContract.manager()
      
      expect(contractManager).to.equals(manager.address);
    })
    
    it("should test for target amount", async () => {
      const { deployedPiggyBankContract, targetAmount } = await loadFixture(deployPiggyBank)
      const contractTargetAmount = await deployedPiggyBankContract.targetAmount()

      expect(contractTargetAmount).to.equals(targetAmount);
    })
    
    it("should test for withdrawal date", async () => {
      const { deployedPiggyBankContract } = await loadFixture(deployPiggyBank)
      const contractWithdrawalDate = await deployedPiggyBankContract.withdrawalDate()

      expect(contractWithdrawalDate).to.equals(1739512800);
    })
    
    it("should initialize other state variable to default", async () => {
      const { deployedPiggyBankContract } = await loadFixture(deployPiggyBank)
      const contributorCount = await deployedPiggyBankContract.contributorsCount()

      expect(contributorCount).to.equals(0);
    })
  })

  describe("Save function", () => {
    it("should save amount sent to it", async () => {
      const {deployedPiggyBankContract} = await loadFixture(deployPiggyBank)
      const amount = hre.ethers.parseEther("0.05")

      await deployedPiggyBankContract.save({ value: amount })

      expect(await deployedPiggyBankContract.getBalance()).to.equal(amount)
      expect(await deployedPiggyBankContract.contributorsCount()).to.equal(1)
    })

    it("multiple users should be able to save", async () => {
      const {deployedPiggyBankContract, manager, account1} = await loadFixture(deployPiggyBank)
      const amount = hre.ethers.parseEther("0.05")
      const expectedContractBalance = hre.ethers.parseEther("0.15")

      await deployedPiggyBankContract.save({ value: amount })
      await deployedPiggyBankContract.connect(manager).save({ value: amount })
      await deployedPiggyBankContract.connect(account1).save({ value: amount })

      expect(await deployedPiggyBankContract.getBalance()).to.equal(expectedContractBalance)
      expect(await deployedPiggyBankContract.contributorsCount()).to.equal(3)
    })

    it("should not increase the contributor count if a user is depositing more than once", async () => {
      const {deployedPiggyBankContract, manager, account1} = await loadFixture(deployPiggyBank)
      const amount = hre.ethers.parseEther("0.05")
      const expectedContractBalance = hre.ethers.parseEther("0.30")

      await deployedPiggyBankContract.save({ value: amount })
      await deployedPiggyBankContract.connect(manager).save({ value: amount })
      await deployedPiggyBankContract.connect(manager).save({ value: amount })
      await deployedPiggyBankContract.connect(account1).save({ value: amount })
      await deployedPiggyBankContract.connect(account1).save({ value: amount })
      await deployedPiggyBankContract.connect(account1).save({ value: amount })

      expect(await deployedPiggyBankContract.getBalance()).to.equal(expectedContractBalance)
      expect(await deployedPiggyBankContract.contributorsCount()).to.equal(3)
    })

    it("should increase the amount a user has deposited", async () => {
      const {deployedPiggyBankContract, owner, manager, account1} = await loadFixture(deployPiggyBank)
      const amount = hre.ethers.parseEther("0.05")
      const expectedManagerContribution = hre.ethers.parseEther("0.1")
      const expectedAccount1Contribution = hre.ethers.parseEther("0.15")

      await deployedPiggyBankContract.save({ value: amount })
      await deployedPiggyBankContract.connect(manager).save({ value: amount })
      await deployedPiggyBankContract.connect(manager).save({ value: amount })
      await deployedPiggyBankContract.connect(account1).save({ value: amount })
      await deployedPiggyBankContract.connect(account1).save({ value: amount })
      await deployedPiggyBankContract.connect(account1).save({ value: amount })

      expect(await deployedPiggyBankContract.contributions(owner.address)).to.equal(amount)
      expect(await deployedPiggyBankContract.contributions(manager.address)).to.equal(expectedManagerContribution)
      expect(await deployedPiggyBankContract.contributions(account1.address)).to.equal(expectedAccount1Contribution)
    })

    it("should emit event after saving amount successfully", async () => {
      const {deployedPiggyBankContract} = await loadFixture(deployPiggyBank)
      const amount = hre.ethers.parseEther("0.05")

      expect(await deployedPiggyBankContract.save({ value: amount })).emit
    })

    it("should revert if save is called by zero ", async () => {
      const {deployedPiggyBankContract, account1} = await loadFixture(deployPiggyBank)

      await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: ["0x0000000000000000000000000000000000000000"],
      });
      const addressZeroRunner = await hre.ethers.getSigner("0x0000000000000000000000000000000000000000")
      await account1.sendTransaction({
        to: addressZeroRunner.address,
        value: hre.ethers.parseEther("1.0"), // Send 1 ETH to zero address
      });
      const amount = hre.ethers.parseEther("0.05")

      expect(deployedPiggyBankContract.connect(addressZeroRunner).save({ value: amount })).reverted
      expect(deployedPiggyBankContract.connect(addressZeroRunner).save({ value: amount })).revertedWith("UNAUTHORIZED ADDRESS")
    })

    it("should revert if current date is greater than withdrawal date", async () => {
      const {deployedPiggyBankContract, futureTime} = await loadFixture(deployPiggyBank);
      const amount = hre.ethers.parseEther("0.05")

      await time.increaseTo(futureTime)

      expect(deployedPiggyBankContract.save({ value: amount })).reverted
      expect(deployedPiggyBankContract.save({ value: amount })).revertedWith("YOU CAN NO LONGER SAVE")
    })

    it("should revert if school fee amount is wrong", async () => {
      const {deployedPiggyBankContract} = await loadFixture(deployPiggyBank);

      expect(deployedPiggyBankContract.save({ value: 0 })).reverted
      expect(deployedPiggyBankContract.save({ value: 0 })).revertedWith("AMOUNT MUST BE GREATER THAN ZERO")
    })
  })

  describe("Withdrawal", () => {
    it("should be able to withdraw funds into manager address", async () => {
      const {deployedPiggyBankContract, manager, futureTime} = await loadFixture(deployPiggyBank);
      const amount = hre.ethers.parseEther("1.5")

      await deployedPiggyBankContract.save({ value: amount })
      
      await time.increaseTo(futureTime)

      await deployedPiggyBankContract.connect(manager).withdrawal()
      const contractBal = await deployedPiggyBankContract.getBalance()
      
      expect(contractBal).to.equal(0)
    })

    it("should emit event after a successful withdrawal", async () => {
      const {deployedPiggyBankContract, manager, futureTime} = await loadFixture(deployPiggyBank)
      const amount = hre.ethers.parseEther("1.5")

      await deployedPiggyBankContract.save({ value: amount })

      await time.increaseTo(futureTime)

      expect(await deployedPiggyBankContract.connect(manager).withdrawal()).emit
    })

    it("should revert if it's not manager trying to withdraw", async () => {
      const {deployedPiggyBankContract, account1} = await loadFixture(deployPiggyBank);
      
      expect(deployedPiggyBankContract.connect(account1).withdrawal()).reverted
      expect(deployedPiggyBankContract.connect(account1).withdrawal()).revertedWith("ONLY MANAGER HAS AUTHORIZE ACCESS")
    })

    it("should revert if withdrawal date is not exceeded", async () => {
      const {deployedPiggyBankContract, manager} = await loadFixture(deployPiggyBank);
      
      expect(deployedPiggyBankContract.connect(manager).withdrawal()).reverted
      expect(deployedPiggyBankContract.connect(manager).withdrawal()).revertedWith("NOT YET TIME")
    })

    it("should revert if amount is not upto target amount", async () => {
      const {deployedPiggyBankContract, manager, futureTime} = await loadFixture(deployPiggyBank);

      await time.increaseTo(futureTime)
      
      expect(deployedPiggyBankContract.connect(manager).withdrawal()).reverted
      expect(deployedPiggyBankContract.connect(manager).withdrawal()).revertedWith("TARGET AMOUNT NOT REACHED")
    })
  })
})