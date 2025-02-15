import { time, loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { expect, should } from 'chai';
import hre from 'hardhat';

describe('OurPiggyBank', () => {
    async function deployOurPiggyBankFixture() {
        const [owner, address1] = await hre.ethers.getSigners();
        const erc20 = await hre.ethers.getContractFactory('OurERC20');
        const erc20Instance = await erc20.deploy('LAGCOIN', 'LGC');
        const erc721 = await hre.ethers.getContractFactory('OurERC721');
        const erc721Instance = await erc721.deploy('LAGCOIN NFT', 'LGC-NFT');
        const piggyBankFactory = await hre.ethers.getContractFactory('OurPiggyBank');
        const duration = 60 * 60;
        const latestTime = await time.latest();
        const _time = latestTime + duration;
        const piggyBank = await piggyBankFactory.deploy(1e9, _time, owner.address, erc20Instance.target, erc721Instance.target);
        return { piggyBank, erc20Instance, erc721Instance, latestTime, owner, address1 };
    };

    describe('Deployment', () => {
        it('Should deploy OurPiggyBank contract', async () => {
            const { piggyBank, owner } = await loadFixture(deployOurPiggyBankFixture);

            expect(await piggyBank.manager()).to.equal(owner.address);
        });

        it('should deploy erc20 contract', async () => {
            const { erc20Instance } = await loadFixture(deployOurPiggyBankFixture);
            expect(await erc20Instance.name()).to.equal('LGC');
        });

        it('should deploy erc721 contract', async () => {
            const { erc721Instance } = await loadFixture(deployOurPiggyBankFixture);
            expect(await erc721Instance.name()).to.equal('LAGCOIN NFT');
        });

        it('Should set the right unlockTime', async () => {
            const { piggyBank } = await loadFixture(deployOurPiggyBankFixture);
            const unlockTime = await piggyBank.withdrawalDate();
            const unlockDate = new Date(Number(unlockTime) * 1000);

            const unlockHour = unlockDate.getHours()

            const durationDate = new Date(((await time.latest()) + 60 * 60) * 1000);

            const durationHour = durationDate.getHours();

            expect(unlockHour).to.equal(durationHour);
        });
        it('should set target amount correctly', async () => {
            const { piggyBank } = await loadFixture(deployOurPiggyBankFixture);
            expect(await piggyBank.targetAmount()).to.equal(1e9);
        });
    });

    describe('Save', () => {
        it('Should save money', async () => {
            const { piggyBank, erc20Instance } = await loadFixture(deployOurPiggyBankFixture);
            const amount = 1e9;
            await erc20Instance.approve(piggyBank.target, amount);
            await piggyBank.save(amount);
            const balance = await piggyBank.getBalance();
            expect(balance).to.equal(amount);
        });
        it('should save money if not manager', async () => {
            const { piggyBank, address1, erc20Instance } = await loadFixture(deployOurPiggyBankFixture);
            const amount = 1e9;
            await erc20Instance.mint(address1, amount);
            await erc20Instance.connect(address1).approve(piggyBank.target, amount);
            await piggyBank.connect(address1).save(amount);
            const balance = await piggyBank.getBalance();
            expect(balance).to.equal(amount);
        });

        it('should save erc20 token', async () => {
            const { piggyBank, erc20Instance } = await loadFixture(deployOurPiggyBankFixture);
            const amount = 1e9;
            await erc20Instance.approve(piggyBank.target, amount);
            await piggyBank.save(amount);
            const balance = await piggyBank.getBalance();
            expect(balance).to.equal(amount);
        });

        it('should mint erc721 token', async () => {
            const { piggyBank, erc721Instance, owner, erc20Instance } = await loadFixture(deployOurPiggyBankFixture);
            await erc721Instance.mint(piggyBank.target);
            await erc20Instance.mint(owner.address, 3e9);
            await erc20Instance.approve(piggyBank.target, 4e9);
            await piggyBank.save(1e9);
            await piggyBank.save(1e9);
            const Id = await erc721Instance.getId(owner);
            const balance = await piggyBank.geterc721Balance(owner);

            expect(balance).to.equal(1);
        });

        it('should not accept money after withdrawal date', async () => {
            const { piggyBank, erc20Instance } = await loadFixture(deployOurPiggyBankFixture);
            const amount = 1e3;
            await time.increase(60 * 60 + 1);
            await erc20Instance.approve(piggyBank.target, amount);
            await expect(piggyBank.save(amount)).to.be.revertedWith('YOU CAN NO LONGER SAVE');
        });


        it('should not accept value less than or equal to 0', async () => {
            const { piggyBank } = await loadFixture(deployOurPiggyBankFixture);
            const amount = 0;
            await expect(piggyBank.save(amount)).to.be.revertedWith('YOU ARE BROKE');
        });

        it('increase contributors count', async () => {
            const { piggyBank, owner, address1, erc20Instance } = await loadFixture(deployOurPiggyBankFixture);
            const amount = 1e9;
            await erc20Instance.approve(piggyBank.target, amount);
            await piggyBank.save(amount);
            await erc20Instance.mint(address1.address, amount);
            await erc20Instance.connect(address1).approve(piggyBank.target, amount);
            await piggyBank.connect(address1).save(amount);
            const contributorCount = await piggyBank.contributorsCount();
            expect(contributorCount).to.equal(2);
        });

        it('increase contributors count once for a contributor regardless multiple savings', async () => {
            const { piggyBank, erc20Instance, owner } = await loadFixture(deployOurPiggyBankFixture);
            const amount = 1e9;
            await erc20Instance.mint(owner.address, amount)
            await erc20Instance.approve(piggyBank.target, amount*2);
            await piggyBank.save(amount);
            await piggyBank.save(amount);
            const contributorCount = await piggyBank.contributorsCount();
            expect(contributorCount).to.equal(1);
        });

        it('contribution mapping is updated', async () => {
            const { piggyBank, owner, erc20Instance } = await loadFixture(deployOurPiggyBankFixture);
            const amount = 1e9;
            await erc20Instance.approve(piggyBank.target, amount);
            await piggyBank.save(amount);
            const contribution = await piggyBank.contributions(owner.address);
            expect(contribution).to.equal(amount);
        });

        it('shoult emit contributed event', async () => {
            const { piggyBank, owner, erc20Instance } = await loadFixture(deployOurPiggyBankFixture);
            const amount = 1e9;
            await erc20Instance.approve(piggyBank.target, amount);
            await expect(piggyBank.save(amount)).to.emit(piggyBank, 'Contributed');
        });


    });

    describe('Withdraw', () => {
        it('Should withdraw money', async () => {
            const { piggyBank, address1, erc20Instance } = await loadFixture(deployOurPiggyBankFixture);
            const amount = 1e9;
            await erc20Instance.approve(piggyBank.target, amount);
            await piggyBank.save(amount);
            const balanceBefore = await piggyBank.getBalance();
            await time.increase(60 * 60 + 1);
            await piggyBank.withdrawal();
            const balanceAfter = await piggyBank.getBalance();
            expect(balanceAfter).to.be.lessThan(balanceBefore);
        });
        it('Should not withdraw money if not manager', async () => {
            const { piggyBank, address1, erc20Instance } = await loadFixture(deployOurPiggyBankFixture);
            const amount = 1e9;
            await erc20Instance.approve(piggyBank.target, amount);
            await piggyBank.save(amount);
            await time.increase(60 * 60 + 1);
            await expect(piggyBank.connect(address1).withdrawal()).to.be.revertedWith('YOU WAN THIEF ABI ?');
        });
        it('Should not withdraw money before withdrawal date', async () => {
            const { piggyBank, address1, erc20Instance } = await loadFixture(deployOurPiggyBankFixture);
            const amount = 1e9;
            await erc20Instance.approve(piggyBank.target, amount);
            await piggyBank.save(amount);
            await expect(piggyBank.withdrawal()).to.be.revertedWith('NOT YET TIME');
        });

        it('Should not withdraw money if target amount is not reached', async () => {
            const { piggyBank, address1, erc20Instance } = await loadFixture(deployOurPiggyBankFixture);
            const amount = 1e4;
            await erc20Instance.approve(piggyBank.target, amount);
            await piggyBank.save(amount);
            await time.increase(60 * 60 + 1);
            await expect(piggyBank.withdrawal()).to.be.revertedWith('TARGET AMOUNT NOT REACHED');
        });
        it('Should emit Withdrawn event', async () => {
            const { piggyBank, address1, erc20Instance } = await loadFixture(deployOurPiggyBankFixture);
            const amount = 1e9;
            await erc20Instance.approve(piggyBank.target, amount);
            await piggyBank.save(amount);
            await time.increase(60 * 60 + 1);
            await expect(piggyBank.withdrawal()).to.emit(piggyBank, 'Withdrawn');
        });

    });



});