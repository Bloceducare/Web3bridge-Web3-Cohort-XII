import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers.js";
import { expect } from "chai";
import hre from "hardhat";

describe("Piggy Bank With Custom Token Interaction", () => {
  const deployPiggyBank = async () => {
    const [owner, manager, account1] = await hre.ethers.getSigners()

    const ERC20Contract = await hre.ethers.getContractFactory("Token")
    const newNFTContract = await hre.ethers.getContractFactory("NewNFT")
    const initialSupply = hre.ethers.parseEther("1000000")
    const token = await ERC20Contract.deploy(initialSupply)
    const nft = await newNFTContract.deploy()

    const targetAmount = hre.ethers.parseEther("2000")
    const withdrawalDate = 1739187900
    const pbContract = await hre.ethers.getContractFactory("PiggyBank")
    const deployedPiggyBank = await pbContract.deploy(targetAmount, withdrawalDate, manager, token, nft)

    const TWO_WEEKS_TIME_IN_SECS = 14 * 24 * 60 * 60;
    const futureTime = (await time.latest()) + TWO_WEEKS_TIME_IN_SECS

    return {deployedPiggyBank, token, nft,  owner, manager, account1, targetAmount, withdrawalDate, futureTime}
  }

  describe("Deployment", () => {
    it("should test if the address passed during initialization is set as the manager", async () => {
      const { deployedPiggyBank, manager } = await loadFixture(deployPiggyBank)
      const contractManager = await deployedPiggyBank.manager()
      
      expect(contractManager).to.equals(manager.address);
    })
    
    it("should test for target amount", async () => {
      const { deployedPiggyBank, targetAmount } = await loadFixture(deployPiggyBank)
      const contractTargetAmount = await deployedPiggyBank.targetAmount()

      expect(contractTargetAmount).to.equals(targetAmount);
    })
    
    it("should test for withdrawal date", async () => {
      const { deployedPiggyBank, withdrawalDate } = await loadFixture(deployPiggyBank)
      const contractWithdrawalDate = await deployedPiggyBank.withdrawalDate()

      expect(contractWithdrawalDate).to.equals(withdrawalDate);
    })
    
    it("should initialize other state variable to default", async () => {
      const { deployedPiggyBank } = await loadFixture(deployPiggyBank)
      const contributorCount = await deployedPiggyBank.contributorsCount()

      expect(contributorCount).to.equals(0);
    })
  })

  describe("Save function", () => {
    it("should save amount sent to it", async () => {
      const {deployedPiggyBank, token} = await loadFixture(deployPiggyBank)
      const amount = hre.ethers.parseEther("500")

      await token.approve(deployedPiggyBank.target, amount)
      await deployedPiggyBank.save(amount)

      expect(await deployedPiggyBank.getBalance()).to.equal(amount)
      expect(await deployedPiggyBank.contributorsCount()).to.equal(1)
    })

    it("should not increase the contributor count if a user is depositing more than once", async () => {
      const {deployedPiggyBank, token} = await loadFixture(deployPiggyBank)
      const approveAmount = hre.ethers.parseEther("2000")
      const amount = hre.ethers.parseEther("500")
      const expectedContractBalance = hre.ethers.parseEther("1500")

      await token.approve(deployedPiggyBank.target, approveAmount)
      await deployedPiggyBank.save(amount)
      await deployedPiggyBank.save(amount)
      await deployedPiggyBank.save(amount)

      expect(await deployedPiggyBank.getBalance()).to.equal(expectedContractBalance)
      expect(await deployedPiggyBank.contributorsCount()).to.equal(1)
    })

    it("should mint nft to the user upon second deposit", async () => {
      const {deployedPiggyBank, token, nft, owner} = await loadFixture(deployPiggyBank)
      const approveAmount = hre.ethers.parseEther("2000")
      const amount = hre.ethers.parseEther("500")

      await token.approve(deployedPiggyBank.target, approveAmount)
      await deployedPiggyBank.save(amount)
      await deployedPiggyBank.save(amount)

      await nft.balanceOf(owner.address)

      expect(await nft.balanceOf(owner.address)).to.equal(1)
    })

    it("should emit event after saving amount successfully", async () => {
      const {deployedPiggyBank, token} = await loadFixture(deployPiggyBank)
      const amount = hre.ethers.parseEther("500")

      await token.approve(deployedPiggyBank.target, amount)

      expect(await deployedPiggyBank.save(amount)).emit
    })

    it("should revert if save is called by zero ", async () => {
      const {deployedPiggyBank, account1} = await loadFixture(deployPiggyBank)

      await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: ["0x0000000000000000000000000000000000000000"],
      });
      const addressZeroRunner = await hre.ethers.getSigner("0x0000000000000000000000000000000000000000")
      await account1.sendTransaction({
        to: addressZeroRunner.address,
        value: hre.ethers.parseEther("1.0"), // Send 1 ETH to zero address
      });
      const amount = hre.ethers.parseEther("50")

      expect(deployedPiggyBank.connect(addressZeroRunner).save(amount)).reverted
      expect(deployedPiggyBank.connect(addressZeroRunner).save(amount)).revertedWith("UNAUTHORIZED ADDRESS")
    })

    it("should revert if current date is greater than withdrawal date", async () => {
      const {deployedPiggyBank, futureTime} = await loadFixture(deployPiggyBank);
      const amount = hre.ethers.parseEther("500")

      await time.increaseTo(futureTime)

      expect(deployedPiggyBank.save(amount)).reverted
      expect(deployedPiggyBank.save(amount)).revertedWith("YOU CAN NO LONGER SAVE")
    })

    it("should revert if school fee amount is wrong", async () => {
      const {deployedPiggyBank} = await loadFixture(deployPiggyBank);

      expect(deployedPiggyBank.save(0)).reverted
      expect(deployedPiggyBank.save(0)).revertedWith("AMOUNT MUST BE GREATER THAN ZERO")
    })
  })

  describe("Withdrawal", () => {
    it("should be able to withdraw funds into manager address", async () => {
      const {deployedPiggyBank, manager,futureTime, token} = await loadFixture(deployPiggyBank);
      const amount = hre.ethers.parseEther("2000")
      await token.approve(deployedPiggyBank.target, amount)
      await deployedPiggyBank.save(amount)
      
      await time.increaseTo(futureTime)

      await deployedPiggyBank.connect(manager).withdrawal(amount)
      const contractBal = await deployedPiggyBank.getBalance()
      
      expect(contractBal).to.equal(0)
    })

    it("should emit event after a successful withdrawal", async () => {
      const {deployedPiggyBank, manager, futureTime, token} = await loadFixture(deployPiggyBank)
      const amount = hre.ethers.parseEther("2000")
      await token.approve(deployedPiggyBank.target, amount)
      await deployedPiggyBank.save(amount)

      await time.increaseTo(futureTime)

      expect(await deployedPiggyBank.connect(manager).withdrawal(amount)).emit
    })

    it("should revert if it's not manager trying to withdraw", async () => {
      const {deployedPiggyBank, account1} = await loadFixture(deployPiggyBank);
      const amount = hre.ethers.parseEther("2000")
      
      expect(deployedPiggyBank.connect(account1).withdrawal(amount)).reverted
      expect(deployedPiggyBank.connect(account1).withdrawal(amount)).revertedWith("ONLY MANAGER HAS AUTHORIZE ACCESS")
    })

    it("should revert if withdrawal date is not exceeded", async () => {
      const {deployedPiggyBank, manager} = await loadFixture(deployPiggyBank);
      const amount = hre.ethers.parseEther("2000")
      
      expect(deployedPiggyBank.connect(manager).withdrawal(amount)).reverted
      expect(deployedPiggyBank.connect(manager).withdrawal(amount)).revertedWith("NOT YET TIME")
    })

    it("should revert if amount is not upto target amount", async () => {
      const {deployedPiggyBank, manager, futureTime, token} = await loadFixture(deployPiggyBank);
      const amount = hre.ethers.parseEther("1500")
      await token.approve(deployedPiggyBank.target, amount)
      await deployedPiggyBank.save(amount)
      await time.increaseTo(futureTime)
      
      expect(deployedPiggyBank.connect(manager).withdrawal(amount)).reverted
      expect(deployedPiggyBank.connect(manager).withdrawal(amount)).revertedWith("TARGET AMOUNT NOT REACHED")
    })
  })
})
