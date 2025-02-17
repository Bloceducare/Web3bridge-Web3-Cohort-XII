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

        const deployPiggyBank = await piggyBank.deploy(1, 80000000000, manager.address);

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

        it('Should withdraw money', async () => {
            let {deployPiggyBank} = await loadFixture(piggyBankContract);

            const runner = deployPiggyBank.runner as HardhatEthersSigner;

            await deployPiggyBank.save({ value: ethers.parseEther("1") });

            const withdrawalDate = await deployPiggyBank.withdrawalDate();
            await ethers.provider.send("evm_setNextBlockTimestamp", [Number(withdrawalDate) + 1]);
            await ethers.provider.send("evm_mine");

            let withdrawMoney = await deployPiggyBank.withdrawal();

            const contributionsAfter = await deployPiggyBank.contributions(runner.address);

            console.log(withdrawMoney);
            expect(contributionsAfter).to.be.equal(0);
        })
    })
})