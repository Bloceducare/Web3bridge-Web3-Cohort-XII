import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import hre from "hardhat";

describe("Swap", () => {
  async function deploySwapFixture() {
    const [owner, user1, user2] = await hre.ethers.getSigners();

    // Deploy tokens
    const TokenX = await hre.ethers.getContractFactory("CoolCoin");
    const tokenA = await TokenX.deploy("Token A", "TKNA");

    const TokenY = await hre.ethers.getContractFactory("Suspicious");
    const tokenB = await TokenY.deploy("Suspicious", "SUS");

    // Deploy Swap contract
    const Swap = await hre.ethers.getContractFactory("Swap");
    const swap = await Swap.deploy(await tokenA.getAddress(), await tokenB.getAddress());

    // Setup initial token balances
    const initialBalance = hre.ethers.parseEther("10000");
    await tokenA.transfer(user1.address, initialBalance);
    await tokenB.transfer(user1.address, initialBalance);
    await tokenA.transfer(user2.address, initialBalance);
    await tokenB.transfer(user2.address, initialBalance);

    // Add initial liquidity to the swap contract
    const liquidityAmount = hre.ethers.parseEther("1000");
    await tokenA.transfer(await swap.getAddress(), liquidityAmount);
    await tokenB.transfer(await swap.getAddress(), liquidityAmount);

    return { swap, tokenA, tokenB, owner, user1, user2 };
  }

  describe("Deployment", () => {
    it("Should set the correct token addresses", async () => {
      const { swap, tokenA, tokenB } = await loadFixture(deploySwapFixture);
      
      expect(await swap.tokenX()).to.equal(await tokenA.getAddress());
      expect(await swap.tokenY()).to.equal(await tokenB.getAddress());
    });
  });

  describe("Swapping", () => {
    it("Should swap tokenX for tokenY", async () => {
      const { swap, tokenA, tokenB, user1 } = await loadFixture(deploySwapFixture);
      
      const swapAmount = hre.ethers.parseEther("100");
      await tokenA.connect(user1).approve(await swap.getAddress(), swapAmount);
      
      const beforeBalanceA = await tokenA.balanceOf(user1.address);
      const beforeBalanceB = await tokenB.balanceOf(user1.address);

      await swap.connect(user1).swap(swapAmount, 0, user1.address);

      const afterBalanceA = await tokenA.balanceOf(user1.address);
      const afterBalanceB = await tokenB.balanceOf(user1.address);

      expect(afterBalanceA).to.be.lessThan(beforeBalanceA);
      expect(afterBalanceB).to.be.greaterThan(beforeBalanceB);
    });

    it("Should swap tokenY for tokenX", async () => {
      const { swap, tokenA, tokenB, user1 } = await loadFixture(deploySwapFixture);
      
      const swapAmount = hre.ethers.parseEther("100");
      await tokenB.connect(user1).approve(await swap.getAddress(), swapAmount);
      
      const beforeBalanceA = await tokenA.balanceOf(user1.address);
      const beforeBalanceB = await tokenB.balanceOf(user1.address);

      await swap.connect(user1).swap(0, swapAmount, user1.address);

      const afterBalanceA = await tokenA.balanceOf(user1.address);
      const afterBalanceB = await tokenB.balanceOf(user1.address);

      expect(afterBalanceA).to.be.greaterThan(beforeBalanceA);
      expect(afterBalanceB).to.be.lessThan(beforeBalanceB);
    });

    it("Should emit Swapped event", async () => {
      const { swap, tokenA, user1 } = await loadFixture(deploySwapFixture);
      
      const swapAmount = hre.ethers.parseEther("100");
      await tokenA.connect(user1).approve(await swap.getAddress(), swapAmount);

      await expect(swap.connect(user1).swap(swapAmount, 0, user1.address))
        .to.emit(swap, "Swapped")
        .withArgs(await tokenA.getAddress(), await tokenA.getAddress(), swapAmount, expect.any(BigInt));
    });
  });

  describe("Error cases", () => {
    it("Should revert with invalidAmount for zero amounts", async () => {
      const { swap, user1 } = await loadFixture(deploySwapFixture);

      await expect(swap.connect(user1).swap(0, 0, user1.address))
        .to.be.revertedWithCustomError(swap, "invalidAmount");
    });

    it("Should revert with invalidAddress for token addresses", async () => {
      const { swap, tokenA, user1 } = await loadFixture(deploySwapFixture);
      
      const swapAmount = hre.ethers.parseEther("100");
      await tokenA.connect(user1).approve(await swap.getAddress(), swapAmount);

      await expect(swap.connect(user1).swap(swapAmount, 0, await tokenA.getAddress()))
        .to.be.revertedWithCustomError(swap, "invalidAddress");
    });

    it("Should revert with insufficientBalance", async () => {
      const { swap, tokenA, user1 } = await loadFixture(deploySwapFixture);
      
      const hugeAmount = hre.ethers.parseEther("1000000");
      await tokenA.connect(user1).approve(await swap.getAddress(), hugeAmount);

      await expect(swap.connect(user1).swap(hugeAmount, 0, user1.address))
        .to.be.revertedWithCustomError(swap, "insufficientBalance");
    });
  });
});