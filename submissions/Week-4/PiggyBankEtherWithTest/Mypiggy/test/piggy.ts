import { time, loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { expect } from 'chai';
import hre from 'hardhat';

describe('PiggyBank', () => {

    async function deployPiggyBankFixture() {
        const [owner, address1] = await hre.ethers.getSigners();
        const piggyBankFactory = await hre.ethers.getContractFactory('PiggyBank');

        const duration = 60 * 60; 
        const latestTime = await time.latest();
        const _time = latestTime + duration;

        const piggyBank = await piggyBankFactory.deploy(1e9, _time, owner.address);
        return { piggyBank, latestTime, owner, address1 };
    }

    describe('Deployment', () => {
      
        it('Should deploy PiggyBank contract', async () => {
            const { piggyBank, owner } = await loadFixture(deployPiggyBankFixture);
            expect(await piggyBank.manager()).to.equal(owner.address);
        });

        
        it('Should set the right unlockTime', async () => {
            const { piggyBank } = await loadFixture(deployPiggyBankFixture);
            const unlockTime = await piggyBank.withdrawalDate();
            const unlockDate = new Date(Number(unlockTime) * 1000);
            const unlockHour = unlockDate.getHours();

            const durationDate = new Date(((await time.latest()) + 60 * 60) * 1000);
            const durationHour = durationDate.getHours();

            expect(unlockHour).to.equal(durationHour);
        });

        
        it('should set target amount correctly', async () => {
            const { piggyBank } = await loadFixture(deployPiggyBankFixture);
            expect(await piggyBank.targetAmount()).to.equal(1e9);
        });
    });

    describe('Save', () => {
        
        it('Should save money', async () => {
            const { piggyBank, owner } = await loadFixture(deployPiggyBankFixture);
            const amount = 1e9;
            await piggyBank.save({ value: amount });
            const balance = await hre.ethers.provider.getBalance(piggyBank.target);
            expect(balance).to.equal(amount);
        });

       
        it('Should save money if not manager', async () => {
            const { piggyBank, address1 } = await loadFixture(deployPiggyBankFixture);
            const amount = 1e9;
            await piggyBank.connect(address1).save({ value: amount });
            const balance = await hre.ethers.provider.getBalance(piggyBank.target);
            expect(balance).to.equal(amount);
        });

       
        it('should not accept savings after withdrawal date', async () => {
            const { piggyBank } = await loadFixture(deployPiggyBankFixture);
            const amount = 1e9;
            await time.increase(60 * 60 + 1);
            await expect(piggyBank.save({ value: amount })).to.be.revertedWith('YOU CAN NO LONGER SAVE');
        });

        
        it('should not accept value less than or equal to 0', async () => {
            const { piggyBank } = await loadFixture(deployPiggyBankFixture);
            const amount = 0;
            await expect(piggyBank.save({ value: amount })).to.be.revertedWith('YOU ARE BROKE');
        });

        
        it('increase contributors count', async () => {
            const { piggyBank, owner, address1 } = await loadFixture(deployPiggyBankFixture);
            const amount = 1e9;
            await piggyBank.save({ value: amount });
            const contributorCount = await piggyBank.contributorsCount();
            expect(contributorCount).to.equal(1);
        });

       
        it('increase contributors count once for a contributor regardless multiple savings', async () => {
            const { piggyBank, owner, address1 } = await loadFixture(deployPiggyBankFixture);
            const amount = 1e9;
            await piggyBank.save({ value: amount });
            await piggyBank.save({ value: amount });
            const contributorCount = await piggyBank.contributorsCount();
            expect(contributorCount).to.equal(1);
        });
    });

    describe('Withdrawal', () => {
      
        it('Should allow manager to withdraw after withdrawal date when target is met', async () => {
            const { piggyBank, owner } = await loadFixture(deployPiggyBankFixture);
            const amount = 1e9;
            await piggyBank.save({ value: amount });
            
            await time.increase(60 * 60 + 1);
            
            await piggyBank.withdrawal();
            const contractBalance = await hre.ethers.provider.getBalance(piggyBank.target);
            expect(contractBalance).to.equal(0);
        });

        
        it('Should not allow withdrawal before withdrawal date', async () => {
            const { piggyBank, owner } = await loadFixture(deployPiggyBankFixture);
            const amount = 1e9;
            await piggyBank.save({ value: amount });
            
            await expect(piggyBank.withdrawal())
                .to.be.revertedWith('NOT YET TIME');
        });

        
        it('Should not allow withdrawal if target amount not reached', async () => {
            const { piggyBank, owner } = await loadFixture(deployPiggyBankFixture);
            const amount = 1e8; 
            await piggyBank.save({ value: amount });
            
            await time.increase(60 * 60 + 1);
            
            await expect(piggyBank.withdrawal())
                .to.be.revertedWith('TARGET AMOUNT NOT REACHED');
        });

        
        it('Should not allow non-manager to withdraw', async () => {
            const { piggyBank, address1 } = await loadFixture(deployPiggyBankFixture);
            const amount = 1e9;
            await piggyBank.save({ value: amount });
            
            await time.increase(60 * 60 + 1);
            
            await expect(piggyBank.connect(address1).withdrawal())
                .to.be.revertedWith('YOU WAN THIEF ABI ?');
        });

        
        it('Should emit Withdrawn event on successful withdrawal', async () => {
            const { piggyBank, owner } = await loadFixture(deployPiggyBankFixture);
            const amount = 1e9;
            await piggyBank.save({ value: amount });
            
            await time.increase(60 * 60 + 1);
            
            await expect(piggyBank.withdrawal())
                .to.emit(piggyBank, 'Withdrawn')
                .withArgs(amount, anyValue); 
        });
    });
});