import { time, loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { expect } from 'chai';
import hre from 'hardhat';

describe('Piggy', () => {
    async function deployPiggyFixture() {
        const [owner, address1] = await hre.ethers.getSigners();
        const erc20 = await hre.ethers.getContractFactory('Dmystical');
        const erc20Instance = await erc20.deploy();
        const erc721 = await hre.ethers.getContractFactory('DmysticalNFT');
        const erc721Instance = await erc721.deploy();
        const piggyFactory = await hre.ethers.getContractFactory('Piggy');
        const duration = 60 * 60;
        const latestTime = await time.latest();
        const _time = latestTime + duration;
        const piggy = await piggyFactory.deploy(1e9, _time, owner.address, erc20Instance.target, erc721Instance.target);
        return { piggy, erc20Instance, erc721Instance, latestTime, owner, address1 };
    };

    describe('Deployment', () => {
        it('Should deploy OurPiggyBank contract', async () => {
            const { piggy, owner } = await loadFixture(deployPiggyFixture);

            expect(await piggy.manager()).to.equal(owner.address);
        });

        it('should deploy erc20 contract', async () => {
            const { erc20Instance } = await loadFixture(deployPiggyFixture);
            expect(await erc20Instance.name()).to.equal('Dmystical');
        });

        it('should deploy erc721 contract', async () => {
            const { erc721Instance } = await loadFixture(deployPiggyFixture);
            expect(await erc721Instance.name()).to.equal('DmysticalNFT');
        });

        it('Should set the right unlockTime', async () => {
            const { piggy } = await loadFixture(deployPiggyFixture);
            const unlockTime = await piggy.withdrawalDate();
            const unlockDate = new Date(Number(unlockTime) * 1000);

            const unlockHour = unlockDate.getHours()

            const durationDate = new Date(((await time.latest()) + 60 * 60) * 1000);

            const durationHour = durationDate.getHours();

            expect(unlockHour).to.equal(durationHour);
        });
        it('should set target amount correctly', async () => {
            const { piggy } = await loadFixture(deployPiggyFixture);
            expect(await piggy.targetAmount()).to.equal(1e9);
        });

        
    });

    describe('Save', () => {
        it('Should save money', async () => {
            const { piggy, erc20Instance } = await loadFixture(deployPiggyFixture);
            const amount = 1e9;
            await erc20Instance.approve(piggy.target, amount);
            await piggy.save(amount);
            const balance = await piggy.getBalance();
            expect(balance).to.equal(amount);
        });
        it('should save money if not manager', async () => {
            const { piggy, address1, erc20Instance } = await loadFixture(deployPiggyFixture);
            const amount = 1e9;
            await erc20Instance.transfer(address1, amount);
            await erc20Instance.connect(address1).approve(piggy.target, amount);
            await piggy.connect(address1).save(amount);
            const balance = await piggy.getBalance();
            expect(balance).to.equal(amount);
        });

        it('should save erc20 token', async () => {
            const { piggy, erc20Instance } = await loadFixture(deployPiggyFixture);
            const amount = 1e9;
            await erc20Instance.approve(piggy.target, amount);
            await piggy.save(amount);
            const balance = await piggy.getBalance();
            expect(balance).to.equal(amount);
        });

        it('should mint erc721 token', async () => {
            const { piggy, erc721Instance, owner, erc20Instance } = await loadFixture(deployPiggyFixture);
            await erc721Instance.awardNft(piggy.target);
            await erc20Instance.transfer(owner.address, 3e9);
            await erc20Instance.approve(piggy.target, 4e9);
            await piggy.save(1e9);
            await piggy.save(1e9);
            const Id = await erc721Instance.getId(owner);
            const balance = await piggy.geterc721Balance(owner);

            expect(balance).to.equal(Id);
        });

        it('should not accept money after withdrawal date', async () => {
            const { piggy, erc20Instance } = await loadFixture(deployPiggyFixture);
            const amount = 1e3;
            await time.increase(60 * 60 + 1);
            await erc20Instance.approve(piggy.target, amount);
            await expect(piggy.save(amount)).to.be.revertedWith('YOU CAN NO LONGER SAVE');
        });


        it('should not accept value less than or equal to 0', async () => {
            const { piggy } = await loadFixture(deployPiggyFixture);
            const amount = 0;
            await expect(piggy.save(amount)).to.be.revertedWith('YOU ARE BROKE');
        });

        it('increase contributors count', async () => {
            const { piggy, owner, address1, erc20Instance } = await loadFixture(deployPiggyFixture);
            const amount = 1e9;
            await erc20Instance.approve(piggy.target, amount);
            await piggy.save(amount);
            await erc20Instance.transfer(address1.address, amount);
            await erc20Instance.connect(address1).approve(piggy.target, amount);
            await piggy.connect(address1).save(amount);
            const contributorCount = await piggy.contributorsCount();
            expect(contributorCount).to.equal(2);
        });

        it('increase contributors count once for a contributor regardless multiple savings', async () => {
            const { piggy, erc20Instance, owner } = await loadFixture(deployPiggyFixture);
            const amount = 1e9;
            await erc20Instance.transfer(owner.address, amount)
            await erc20Instance.approve(piggy.target, amount*2);
            await piggy.save(amount);
            await piggy.save(amount);
            const contributorCount = await piggy.contributorsCount();
            expect(contributorCount).to.equal(1);
        });

        it('contribution mapping is updated', async () => {
            const { piggy, owner, erc20Instance } = await loadFixture(deployPiggyFixture);
            const amount = 1e9;
            await erc20Instance.approve(piggy.target, amount);
            await piggy.save(amount);
            const contribution = await piggy.contributions(owner.address);
            expect(contribution).to.equal(amount);
        });

        it('shoult emit contributed event', async () => {
            const { piggy, owner, erc20Instance } = await loadFixture(deployPiggyFixture);
            const amount = 1e9;
            await erc20Instance.approve(piggy.target, amount);
            await expect(piggy.save(amount)).to.emit(piggy, 'Contributed');
        });


    });

    describe('Withdraw', () => {
        it('Should withdraw money', async () => {
            const { piggy, address1, erc20Instance } = await loadFixture(deployPiggyFixture);
            const amount = 1e9;
            await erc20Instance.approve(piggy.target, amount);
            await piggy.save(amount);
            const balanceBefore = await piggy.getBalance();
            await time.increase(60 * 60 + 1);
            await piggy.withdrawal();
            const balanceAfter = await piggy.getBalance();
            expect(balanceAfter).to.be.lessThan(balanceBefore);
        });
        it('Should not withdraw money if not manager', async () => {
            const { piggy, address1, erc20Instance } = await loadFixture(deployPiggyFixture);
            const amount = 1e9;
            await erc20Instance.approve(piggy.target, amount);
            await piggy.save(amount);
            await time.increase(60 * 60 + 1);
            await expect(piggy.connect(address1).withdrawal()).to.be.revertedWith('YOU WAN THIEF ABI ?');
        });
        it('Should not withdraw money before withdrawal date', async () => {
            const { piggy, address1, erc20Instance } = await loadFixture(deployPiggyFixture);
            const amount = 1e9;
            await erc20Instance.approve(piggy.target, amount);
            await piggy.save(amount);
            await expect(piggy.withdrawal()).to.be.revertedWith('NOT YET TIME');
        });

        it('Should not withdraw money if target amount is not reached', async () => {
            const { piggy, address1, erc20Instance } = await loadFixture(deployPiggyFixture);
            const amount = 1e4;
            await erc20Instance.approve(piggy.target, amount);
            await piggy.save(amount);
            await time.increase(60 * 60 + 1);
            await expect(piggy.withdrawal()).to.be.revertedWith('TARGET AMOUNT NOT REACHED');
        });
        it('Should emit Withdrawn event', async () => {
            const { piggy, address1, erc20Instance } = await loadFixture(deployPiggyFixture);
            const amount = 1e9;
            await erc20Instance.approve(piggy.target, amount);
            await piggy.save(amount);
            await time.increase(60 * 60 + 1);
            await expect(piggy.withdrawal()).to.emit(piggy, 'Withdrawn');
        });

    });



});