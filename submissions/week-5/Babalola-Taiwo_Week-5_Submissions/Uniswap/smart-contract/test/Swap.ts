import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Swap", () => {
  async function deploySwapAndTokenFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const tokenXFactory = await ethers.getContractFactory("Token");
    const tokenYFactory = await ethers.getContractFactory("Token");

    const tokenX = await tokenXFactory.deploy("TokenX", "TKX");
    const tokenY = await tokenYFactory.deploy("TokenY", "TKY");

    const swapFactory = await ethers.getContractFactory("Swap");
    const swap = await swapFactory.deploy(tokenX.target, tokenY.target);

    return { swap, tokenX, tokenY, owner, addr1, addr2 };
  }

  describe("Deployment", () => {
    it("Should set the right tokens", async () => {
      const { swap, tokenX, tokenY } = await loadFixture(deploySwapAndTokenFixture);
      expect(await swap.tokenX()).to.equal(tokenX.target);
      expect(await swap.tokenY()).to.equal(tokenY.target);
    });

    it("Should set the right token owners", async () => {
      const { tokenX, tokenY, owner } = await loadFixture(deploySwapAndTokenFixture);
      expect(await tokenX.owner()).to.equal(owner.address);
      expect(await tokenY.owner()).to.equal(owner.address);
    });

    it("Should initialize with zero reserves", async () => {
      const { swap } = await loadFixture(deploySwapAndTokenFixture);
      expect(await swap.reserveX()).to.equal(0);
      expect(await swap.reserveY()).to.equal(0);
    });
  });

  describe("Liquidity", () => {
    it("Should add liquidity correctly", async () => {
      const { swap, tokenX, tokenY, owner } = await loadFixture(deploySwapAndTokenFixture);
      
      // Mint tokens to owner
      await tokenX.mint(owner.address, ethers.parseUnits("1000", 18));
      await tokenY.mint(owner.address, ethers.parseUnits("2000", 18));
      
      // Approve swap contract
      await tokenX.approve(swap.target, ethers.parseUnits("1000", 18));
      await tokenY.approve(swap.target, ethers.parseUnits("2000", 18));
      
      // Add liquidity
      await expect(swap.addLiquidity(ethers.parseUnits("1000", 18), ethers.parseUnits("2000", 18)))
        .to.emit(swap, "LiquidityAdded")
        .withArgs(owner.address, ethers.parseUnits("1000", 18), ethers.parseUnits("2000", 18));
      
      // Check reserves
      expect(await swap.reserveX()).to.equal(ethers.parseUnits("1000", 18));
      expect(await swap.reserveY()).to.equal(ethers.parseUnits("2000", 18));
    });
  });

  describe("Swapping", () => {
    async function setupPoolWithLiquidity() {
      const fixture = await deploySwapAndTokenFixture();
      const { swap, tokenX, tokenY, owner, addr1 } = fixture;
      
      // Add initial liquidity
      await tokenX.mint(owner.address, ethers.parseUnits("1000", 18));
      await tokenY.mint(owner.address, ethers.parseUnits("2000", 18));
      await tokenX.approve(swap.target, ethers.parseUnits("1000", 18));
      await tokenY.approve(swap.target, ethers.parseUnits("2000", 18));
      await swap.addLiquidity(ethers.parseUnits("1000", 18), ethers.parseUnits("2000", 18));
      
      // Mint trading tokens to addr1
      await tokenX.mint(addr1.address, ethers.parseUnits("100", 18));
      await tokenY.mint(addr1.address, ethers.parseUnits("200", 18));
      
      return fixture;
    }

    it("Should swap TokenX for TokenY correctly", async () => {
      const { swap, tokenX, tokenY, addr1 } = await setupPoolWithLiquidity();
      
      const amountXIn = ethers.parseUnits("10", 18);
      
      // Calculate expected output
      const reserveX = await swap.reserveX();
      const reserveY = await swap.reserveY();
      const amountXWithFee = (amountXIn * BigInt(997)) / BigInt(1000); // 0.3% fee
      const expectedAmountOut = (reserveY * amountXWithFee) / (reserveX + amountXWithFee);
      
      // Initial balances
      const initialAddr1BalanceY = await tokenY.balanceOf(addr1.address);
      
      // Approve and swap
      await tokenX.connect(addr1).approve(swap.target, amountXIn);
      
      await expect(swap.connect(addr1).swapXforY(amountXIn))
        .to.emit(swap, "Swapped")
        .withArgs(addr1.address, tokenX.target, amountXIn, expectedAmountOut);
      
      // Check balances and reserves
      expect(await tokenY.balanceOf(addr1.address)).to.equal(initialAddr1BalanceY + expectedAmountOut);
      expect(await swap.reserveX()).to.equal(reserveX + amountXWithFee);
      expect(await swap.reserveY()).to.equal(reserveY - expectedAmountOut);
    });

    it("Should swap TokenY for TokenX correctly", async () => {
      const { swap, tokenX, tokenY, addr1 } = await setupPoolWithLiquidity();
      
      const amountYIn = ethers.parseUnits("20", 18);
      
      // Calculate expected output
      const reserveX = await swap.reserveX();
      const reserveY = await swap.reserveY();
      const amountYWithFee = (amountYIn * BigInt(997)) / BigInt(1000); // 0.3% fee
      const expectedAmountOut = (reserveX * amountYWithFee) / (reserveY + amountYWithFee);
      
      // Initial balances
      const initialAddr1BalanceX = await tokenX.balanceOf(addr1.address);
      
      // Approve and swap
      await tokenY.connect(addr1).approve(swap.target, amountYIn);
      
      await expect(swap.connect(addr1).swapYforX(amountYIn))
        .to.emit(swap, "Swapped")
        .withArgs(addr1.address, tokenY.target, amountYIn, expectedAmountOut);
      
      // Check balances and reserves
      expect(await tokenX.balanceOf(addr1.address)).to.equal(initialAddr1BalanceX + expectedAmountOut);
      expect(await swap.reserveY()).to.equal(reserveY + amountYWithFee);
      expect(await swap.reserveX()).to.equal(reserveX - expectedAmountOut);
    });

    it("Should revert with InsufficientAmount for zero input", async () => {
      const { swap, addr1 } = await setupPoolWithLiquidity();
      
      await expect(swap.connect(addr1).swapXforY(0)).to.be.revertedWithCustomError(swap, "InsufficientAmount");
      await expect(swap.connect(addr1).swapYforX(0)).to.be.revertedWithCustomError(swap, "InsufficientAmount");
    });   
  });
});