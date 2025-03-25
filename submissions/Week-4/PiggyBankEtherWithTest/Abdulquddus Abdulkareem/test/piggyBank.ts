import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
  import hre, { ethers } from "hardhat";
  import { expect } from "chai";
  
  describe("piggyBank", () => {
    const deployPiggyBankContract = async () => {
      const [manager,member] = await hre.ethers.getSigners(); 
      const targetAmount = hre.ethers.parseEther("1000");
      const withdrawalDate = Math.floor(new Date(2025, 10, 10).getTime() / 1000);  
      const PiggyBank = await hre.ethers.getContractFactory("piggyBank");
      const deployedPiggyBank = await PiggyBank.deploy(
        targetAmount,
        withdrawalDate,
        manager.address
      );
  
      return { deployedPiggyBank, manager, targetAmount, withdrawalDate, member };
    };
  
    describe("Deployment", () => {
        it("should be deployed by manager", async () => {
            let { deployedPiggyBank, manager } = await loadFixture(deployPiggyBankContract);       
            const owner = deployedPiggyBank.runner as HardhatEthersSigner;
            expect(owner.address).to.equal(manager.address);
        });

        it("target amount should be greater than 1", async () => {
            let {targetAmount} = await loadFixture(deployPiggyBankContract);       
            const amount = ethers.parseEther("1");
            expect(targetAmount).to.greaterThan(amount);
        });

        it("withdrawal date should be greater than current date", async () => {
            let {withdrawalDate} = await loadFixture(deployPiggyBankContract);       
            const today = Math.floor(new Date().getTime() / 1000);
            expect(withdrawalDate).to.greaterThan(today);
        });
    });

    describe("save", () => {
        it("should deposit amount", async () => {
            let { deployedPiggyBank, member } = await loadFixture(deployPiggyBankContract);       
            const amount = ethers.parseEther("100");
            await deployedPiggyBank.connect(member).save({ value: amount });
            const memberBal= await deployedPiggyBank.contributions(member.address);
            expect(memberBal).to.equal(amount)
        });
    });


    describe("withdrawal", () => {
        it("should remove whole balance", async () => {
            let { deployedPiggyBank, member, manager,withdrawalDate, targetAmount } = await loadFixture(deployPiggyBankContract);        
            const saveAmount = ethers.parseEther("1000");
            await deployedPiggyBank.connect(member).save({ value:saveAmount });         
            await time.increaseTo(withdrawalDate); 
            const contractBalanceBefore = await ethers.provider.getBalance(deployedPiggyBank.target);
            expect(contractBalanceBefore).to.greaterThanOrEqual(targetAmount);
            await deployedPiggyBank.connect(manager).withdrawal();
            const contractBalanceAfter = await ethers.provider.getBalance(deployedPiggyBank.target);
            expect(contractBalanceAfter).to.lessThan(contractBalanceBefore);
        });
    });
  });
  