const { expect } = require('chai');
const { ethers } = require('hardhat');
const { time } = require('@nomicfoundation/hardhat-toolbox/network-helpers');

describe('SavingsContract', function () {
  let SavingsContract, savingsContract, owner, addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    SavingsContract = await ethers.getContractFactory('SavingsContract');
    savingsContract = await SavingsContract.deploy();
    await savingsContract.waitForDeployment();
  });

  it('Should allow a user to deposit funds', async function () {
    await savingsContract
      .connect(addr1)
      .deposit({ value: ethers.parseEther('1') });
    const savingsDetails = await savingsContract
      .connect(addr1)
      .getSavingsDetails();
    expect(savingsDetails.balance).to.equal(ethers.parseEther('1'));
  });

  it('Should allow a user to set a savings goal', async function () {
    await savingsContract
      .connect(addr1)
      .setSavingsGoal(ethers.parseEther('2'), 5);
    const savingsDetails = await savingsContract
      .connect(addr1)
      .getSavingsDetails();
    expect(savingsDetails.goal).to.equal(ethers.parseEther('2'));
  });

  it('Should prevent withdrawal before unlock time', async function () {
    await savingsContract
      .connect(addr1)
      .setSavingsGoal(ethers.parseEther('1'), 5);
    await savingsContract
      .connect(addr1)
      .deposit({ value: ethers.parseEther('1') });
    await expect(savingsContract.connect(addr1).withdraw()).to.be.revertedWith(
      'Funds are locked'
    );
  });

  it('Should allow withdrawal after unlock time if goal is met', async function () {
    await savingsContract
      .connect(addr1)
      .setSavingsGoal(ethers.parseEther('1'), 1);
    await savingsContract
      .connect(addr1)
      .deposit({ value: ethers.parseEther('1') });
    const ONE_DAY_IN_SECS = 24 * 60 * 60;
    const unlockTime = (await time.latest()) + ONE_DAY_IN_SECS;
    await time.increaseTo(unlockTime);

    await expect(savingsContract.connect(addr1).withdraw())
      .to.emit(savingsContract, 'Withdrawn')
      .withArgs(addr1.address, ethers.parseEther('1'));
  });
});