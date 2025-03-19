import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { assert } from "console";
import hre, { ethers } from "hardhat";
import { expect } from "chai";

describe('Piggy Bank test', () => {

    const piggyBankContract = async () => {

        const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'

        const [manager, account1] = await hre.ethers.getSigners();

        const piggyBank = await hre.ethers.getContractFactory("PiggyBank");

        const deployPiggyBank = await piggyBank.deploy(ethers.parseEther("5"), 80000000000, manager.address);

        return {deployPiggyBank, manager, account1, ADDRESS_ZERO}
    }

    describe('Deploy Piggy Bank', () => {
        it('Should deploy piggy bank smart contract by manager', async () => {
            let {deployPiggyBank, manager} = await loadFixture(piggyBankContract);

            const runner = deployPiggyBank.runner as HardhatEthersSigner;

            expect(runner.address).to.be.equal(manager.address);
        })

        it('Should not be address zero', async () => {
            let {deployPiggyBank, ADDRESS_ZERO} = await loadFixture(piggyBankContract);

            expect(deployPiggyBank.target).to.not.be.equal(ADDRESS_ZERO);
        })
    })

    describe('Save money', () => {
        it('Should save money', async () => {
            let {deployPiggyBank} = await loadFixture(piggyBankContract);

            const runner = deployPiggyBank.runner as HardhatEthersSigner;

            let contributionsBefore = await deployPiggyBank.contributions(runner.address);

            let saveMoney = await deployPiggyBank.save({ value: ethers.parseEther("1") });

            let contributionsAfter = await deployPiggyBank.contributions(runner.address);

            console.log(saveMoney);
            expect(contributionsAfter).to.be.greaterThan(contributionsBefore);
        })
    })

    describe('Withdraw money', () => {
        it('Should check if the runner is the manager', async () => {
            let {deployPiggyBank, manager} = await loadFixture(piggyBankContract);

            const runner = deployPiggyBank.runner as HardhatEthersSigner;

            expect(runner.address).to.be.equal(manager.address);
        })

        it('Should test when the time of withdrawal is not already arrived', async () => {
            let {deployPiggyBank, manager} = await loadFixture(piggyBankContract);

            await deployPiggyBank.save({ value: ethers.parseEther("1") });

            const withdrawalDate = await deployPiggyBank.withdrawalDate();
            let today = await ethers.provider.send("evm_setNextBlockTimestamp", [Number(withdrawalDate) - 1]);
            await ethers.provider.send("evm_mine");

            expect(today).to.be.lessThan(withdrawalDate).to.be.revertedWith("NOT YET TIME");
        })

        it('Should test when the target amount is not sufficiant', async () => {
            let {deployPiggyBank} = await loadFixture(piggyBankContract);

            await deployPiggyBank.save({ value: ethers.parseEther("1") });

            const withdrawalDate = await deployPiggyBank.withdrawalDate();
            await ethers.provider.send("evm_setNextBlockTimestamp", [Number(withdrawalDate) + 1]);
            await ethers.provider.send("evm_mine");
            
            const targetAmount = await deployPiggyBank.targetAmount();
            const balance = await ethers.provider.getBalance(deployPiggyBank.getAddress());

            expect(BigInt(targetAmount)).to.be.greaterThan(balance).to.be.revertedWith('TARGET AMOUNT NOT REACHED');
        })

        it('Should withdraw money', async () => {
            let {deployPiggyBank, manager} = await loadFixture(piggyBankContract);

            const runner = deployPiggyBank.runner as HardhatEthersSigner;

            await deployPiggyBank.save({ value: ethers.parseEther("10") });

            const withdrawalDate = await deployPiggyBank.withdrawalDate();
            await ethers.provider.send("evm_setNextBlockTimestamp", [Number(withdrawalDate) + 1]);
            await ethers.provider.send("evm_mine");

            const managerAccountBanlanceBeforeWithdrawal = await ethers.provider.getBalance(manager.address);

            let withdrawMoney = await deployPiggyBank.withdrawal();

            const balanceAfter = await ethers.provider.getBalance(deployPiggyBank.target);
            
            const managerAccountBanlanceAfterWithdrawal = await ethers.provider.getBalance(manager.address);

            console.log(withdrawMoney);
            expect(balanceAfter).to.be.equal(0);
            expect(managerAccountBanlanceBeforeWithdrawal).to.be.lessThan(managerAccountBanlanceAfterWithdrawal);
        })
    })
})