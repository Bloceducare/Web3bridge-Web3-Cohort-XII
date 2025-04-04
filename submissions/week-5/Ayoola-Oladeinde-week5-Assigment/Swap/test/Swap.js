const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('SimpleSwap', function () {
  let tokenA, tokenB, swap, owner, addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();

    const TokenA = await ethers.getContractFactory('TokenA');
    tokenA = await TokenA.deploy(owner.address, owner.address);
    await tokenA.waitForDeployment();
    console.log('TokenA deployed at:', tokenA.target);

    const TokenB = await ethers.getContractFactory('TokenB');
    tokenB = await TokenB.deploy(owner.address, owner.address);
    await tokenB.waitForDeployment();
    console.log('TokenB deployed at:', tokenB.target);

    const SimpleSwap = await ethers.getContractFactory('SimpleSwap');
    swap = await SimpleSwap.deploy(tokenA.target, tokenB.target);
    await swap.waitForDeployment();

    await tokenA.transfer(addr1.address, ethers.parseEther('100'));
    await tokenB.transfer(addr1.address, ethers.parseEther('100'));

    await tokenA.approve(swap.target, ethers.parseEther('100'));
    await tokenB.approve(swap.target, ethers.parseEther('100'));
    await swap.addLiquidity(ethers.parseEther('100'), ethers.parseEther('100'));
  });

  it('should allow swapping with correct output amount and fee deduction', async function () {
    await tokenA.connect(addr1).approve(swap.target, ethers.parseEther('10'));
    const minOutput = ethers.parseEther('9.7'); // Allowing slippage

    await expect(() =>
      swap.connect(addr1).swap(tokenA, ethers.parseEther('10'), minOutput)
    ).to.changeTokenBalances(
      tokenB,
      [addr1, swap],
      [minOutput, -minOutput]
    );
  });

  it('should fail if slippage protection is exceeded', async function () {
    await tokenA.connect(addr1).approve(swap.target, ethers.parseEther('10'));
    const minOutput = ethers.parseEther('9.99'); // Setting too high expectation

    await expect(
      swap
        .connect(addr1)
        .swap(tokenA.target, ethers.parseEther('10'), minOutput)
    ).to.be.revertedWithCustomError(swap, 'SlippageExceeded');
  });

  it('should deduct a 0.03% fee from input amount', async function () {
    await tokenA.connect(addr1).approve(swap.target, ethers.parseEther('10'));
    await swap.connect(addr1).swap(tokenA.target, ethers.parseEther('10'), 0);

    const reserveA = await swap.reserveA();
    expect(reserveA).to.equal(ethers.parseEther('110.003')); // 0.03% fee added to reserves
  });
});
