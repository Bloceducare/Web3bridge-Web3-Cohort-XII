// import { time, loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
// import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
// import { expect } from 'chai';
// import hre from 'hardhat';

// describe('PiggyBank', () => {

//     async function deployPiggyBankFixture() {
//         const [owner, address1] = await hre.ethers.getSigners();
//         const piggyBankFactory = await hre.ethers.getContractFactory('PiggyBank');

//         const duration = 60 * 60; // 1 hour in seconds
//         const latestTime = await time.latest();
//         const _time = latestTime + duration;

//         const piggyBank = await piggyBankFactory.deploy(1e9, _time, owner.address);
//         return { piggyBank, latestTime, owner, address1 };
//     }

//     describe('Deployment', () => {
//         /**
//          * Test Case: Contract Deployment
//          * Verifies that the contract deploys successfully and sets the correct manager
//          */
//         it('Should deploy PiggyBank contract', async () => {
//             const { piggyBank, owner } = await loadFixture(deployPiggyBankFixture);
//             expect(await piggyBank.manager()).to.equal(owner.address);
//         });

//         /**
//          * Test Case: Unlock Time Setting
//          * Verifies that the withdrawal date is set correctly during deployment
//          * Compares the contract's unlock time with the calculated duration
//          */
//         it('Should set the right unlockTime', async () => {
//             const { piggyBank } = await loadFixture(deployPiggyBankFixture);
//             const unlockTime = await piggyBank.withdrawalDate();
//             const unlockDate = new Date(Number(unlockTime) * 1000);
//             const unlockHour = unlockDate.getHours();

//             const durationDate = new Date(((await time.latest()) + 60 * 60) * 1000);
//             const durationHour = durationDate.getHours();

//             expect(unlockHour).to.equal(durationHour);
//         });

//         /**
//          * Test Case: Target Amount Setting
//          * Verifies that the target amount is set correctly during deployment
//          */
//         it('should set target amount correctly', async () => {
//             const { piggyBank } = await loadFixture(deployPiggyBankFixture);
//             expect(await piggyBank.targetAmount()).to.equal(1e9);
//         });
//     });

//     describe('Save', () => {
//         /**
//          * Test Case: Basic Saving Functionality
//          * Verifies that the contract can receive funds
//          * Checks if the contract balance updates correctly
//          */
//         it('Should save money', async () => {
//             const { piggyBank, owner } = await loadFixture(deployPiggyBankFixture);
//             const amount = 1e9;
//             await piggyBank.save({ value: amount });
//             const balance = await hre.ethers.provider.getBalance(piggyBank.target);
//             expect(balance).to.equal(amount);
//         });

//         /**
//          * Test Case: Non-Manager Saving
//          * Verifies that addresses other than the manager can save money
//          * Tests accessibility of the save function
//          */
//         it('Should save money if not manager', async () => {
//             const { piggyBank, address1 } = await loadFixture(deployPiggyBankFixture);
//             const amount = 1e9;
//             await piggyBank.connect(address1).save({ value: amount });
//             const balance = await hre.ethers.provider.getBalance(piggyBank.target);
//             expect(balance).to.equal(amount);
//         });

//         /**
//          * Test Case: Saving After Withdrawal Date
//          * Verifies that saving is not possible after the withdrawal date
//          * Tests the time-based restriction on savings
//          */
//         it('should not accept savings after withdrawal date', async () => {
//             const { piggyBank } = await loadFixture(deployPiggyBankFixture);
//             const amount = 1e9;
//             await time.increase(60 * 60 + 1);
//             await expect(piggyBank.save({ value: amount })).to.be.revertedWith('YOU CAN NO LONGER SAVE');
//         });

//         /**
//          * Test Case: Zero Value Saving
//          * Verifies that the contract rejects attempts to save zero or negative amounts
//          * Tests the minimum value requirement
//          */
//         it('should not accept value less than or equal to 0', async () => {
//             const { piggyBank } = await loadFixture(deployPiggyBankFixture);
//             const amount = 0;
//             await expect(piggyBank.save({ value: amount })).to.be.revertedWith('YOU ARE BROKE');
//         });

//         /**
//          * Test Case: Contributors Count
//          * Verifies that the contributors count increases correctly for new savers
//          */
//         it('increase contributors count', async () => {
//             const { piggyBank, owner, address1 } = await loadFixture(deployPiggyBankFixture);
//             const amount = 1e9;
//             await piggyBank.save({ value: amount });
//             const contributorCount = await piggyBank.contributorsCount();
//             expect(contributorCount).to.equal(1);
//         });

//         /**
//          * Test Case: Multiple Savings from Same Address
//          * Verifies that multiple savings from the same address only count once in contributors count
//          * Tests the unique contributor tracking logic
//          */
//         it('increase contributors count once for a contributor regardless multiple savings', async () => {
//             const { piggyBank, owner, address1 } = await loadFixture(deployPiggyBankFixture);
//             const amount = 1e9;
//             await piggyBank.save({ value: amount });
//             await piggyBank.save({ value: amount });
//             const contributorCount = await piggyBank.contributorsCount();
//             expect(contributorCount).to.equal(1);
//         });
//     });

//     describe('Withdrawal', () => {
//         /**
//          * Test Case: Successful Withdrawal
//          * Verifies that the manager can withdraw funds after the withdrawal date
//          * when the target amount is met
//          */
//         it('Should allow manager to withdraw after withdrawal date when target is met', async () => {
//             const { piggyBank, owner } = await loadFixture(deployPiggyBankFixture);
//             const amount = 1e9;
//             await piggyBank.save({ value: amount });
            
//             await time.increase(60 * 60 + 1);
            
//             await piggyBank.withdrawal();
//             const contractBalance = await hre.ethers.provider.getBalance(piggyBank.target);
//             expect(contractBalance).to.equal(0);
//         });

//         /**
//          * Test Case: Early Withdrawal Prevention
//          * Verifies that withdrawal cannot occur before the withdrawal date
//          * Tests the time-based restriction
//          */
//         it('Should not allow withdrawal before withdrawal date', async () => {
//             const { piggyBank, owner } = await loadFixture(deployPiggyBankFixture);
//             const amount = 1e9;
//             await piggyBank.save({ value: amount });
            
//             await expect(piggyBank.withdrawal())
//                 .to.be.revertedWith('NOT YET TIME');
//         });

//         /**
//          * Test Case: Insufficient Funds Withdrawal
//          * Verifies that withdrawal is prevented if target amount isn't reached
//          * Tests the minimum balance requirement
//          */
//         it('Should not allow withdrawal if target amount not reached', async () => {
//             const { piggyBank, owner } = await loadFixture(deployPiggyBankFixture);
//             const amount = 1e8; // Less than target amount
//             await piggyBank.save({ value: amount });
            
//             await time.increase(60 * 60 + 1);
            
//             await expect(piggyBank.withdrawal())
//                 .to.be.revertedWith('TARGET AMOUNT NOT REACHED');
//         });

//         /**
//          * Test Case: Unauthorized Withdrawal
//          * Verifies that non-manager addresses cannot withdraw funds
//          * Tests the onlyManager modifier
//          */
//         it('Should not allow non-manager to withdraw', async () => {
//             const { piggyBank, address1 } = await loadFixture(deployPiggyBankFixture);
//             const amount = 1e9;
//             await piggyBank.save({ value: amount });
            
//             await time.increase(60 * 60 + 1);
            
//             await expect(piggyBank.connect(address1).withdrawal())
//                 .to.be.revertedWith('YOU WAN THIEF ABI ?');
//         });

//         /**
//          * Test Case: Withdrawal Event
//          * Verifies that the Withdrawn event is emitted correctly
//          * Tests event emission with correct parameters
//          */
//         it('Should emit Withdrawn event on successful withdrawal', async () => {
//             const { piggyBank, owner } = await loadFixture(deployPiggyBankFixture);
//             const amount = 1e9;
//             await piggyBank.save({ value: amount });
            
//             await time.increase(60 * 60 + 1);
            
//             await expect(piggyBank.withdrawal())
//                 .to.emit(piggyBank, 'Withdrawn')
//                 .withArgs(amount, anyValue); // anyValue for timestamp
//         });
//     });
// });