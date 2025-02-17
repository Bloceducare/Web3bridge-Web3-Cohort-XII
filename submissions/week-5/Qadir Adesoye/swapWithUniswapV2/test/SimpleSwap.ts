import { expect } from "chai";
import { ethers } from "hardhat";
import { SimpleSwap, MockERC20 } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("SimpleSwap", function () {
  let simpleSwap: SimpleSwap;
  let token0: MockERC20;
  let token1: MockERC20;
  let owner: HardhatEthersSigner;
  let addr1: HardhatEthersSigner;

  const initialSupply = ethers.parseEther("1000");
  const initialLiquidity = ethers.parseEther("100");

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();

    // Deploy mock tokens
    const Token = await ethers.getContractFactory("MockERC20");
    token0 = await Token.deploy("Token0", "TK0");
    token1 = await Token.deploy("Token1", "TK1");

    // Deploy SimpleSwap
    const SimpleSwap = await ethers.getContractFactory("SimpleSwap");
    simpleSwap = await SimpleSwap.deploy(await token0.getAddress(), await token1.getAddress());

    // Mint tokens to owner and addr1
    await token0.connect(owner).mint(await owner.getAddress(), initialSupply);
    await token1.connect(owner).mint(await owner.getAddress(), initialSupply);
    await token0.connect(owner).mint(await addr1.getAddress(), initialSupply);
    await token1.connect(owner).mint(await addr1.getAddress(), initialSupply);

    // Approve SimpleSwap to spend tokens
    await token0.connect(owner).approve(await simpleSwap.getAddress(), ethers.MaxUint256);
    await token1.connect(owner).approve(await simpleSwap.getAddress(), ethers.MaxUint256);
    await token0.connect(addr1).approve(await simpleSwap.getAddress(), ethers.MaxUint256);
    await token1.connect(addr1).approve(await simpleSwap.getAddress(), ethers.MaxUint256);
  });

  describe("Deployment", function () {
    it("Should set the right token addresses", async function () {
      expect(await simpleSwap.token0()).to.equal(await token0.getAddress());
      expect(await simpleSwap.token1()).to.equal(await token1.getAddress());
    });

    it("Should fail to deploy with zero address tokens", async function () {
      const SimpleSwap = await ethers.getContractFactory("SimpleSwap");
      await expect(
        SimpleSwap.deploy(ethers.ZeroAddress, await token1.getAddress())
      ).to.be.revertedWith("Invalid token address");
      await expect(
        SimpleSwap.deploy(await token0.getAddress(), ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid token address");
    });
  });

  describe("Liquidity", function () {
    it("Should add initial liquidity correctly", async function () {
      const amount0 = ethers.parseEther("100");
      const amount1 = ethers.parseEther("100");

      await expect(simpleSwap.connect(owner).addLiquidity(amount0, amount1))
        .to.emit(simpleSwap, "LiquidityAdded")
        .withArgs(await owner.getAddress(), amount0, amount1);

      const [reserve0, reserve1] = await simpleSwap.getReserves();
      expect(reserve0).to.equal(amount0);
      expect(reserve1).to.equal(amount1);
    });

    it("Should fail to add liquidity with zero amounts", async function () {
      await expect(
        simpleSwap.connect(owner).addLiquidity(0, ethers.parseEther("100"))
      ).to.be.revertedWith("Insufficient liquidity amount");
      await expect(
        simpleSwap.connect(owner).addLiquidity(ethers.parseEther("100"), 0)
      ).to.be.revertedWith("Insufficient liquidity amount");
    });

    it("Should fail to add liquidity with insufficient balance", async function () {
      const largeAmount = ethers.parseEther("2000");
      await expect(
        simpleSwap.connect(addr1).addLiquidity(largeAmount, largeAmount)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });
  });

  describe("Swapping", function () {
    beforeEach(async function () {
      // Add initial liquidity
      await simpleSwap.connect(owner).addLiquidity(initialLiquidity, initialLiquidity);
    });

    it("Should swap token0 for token1 correctly", async function () {
      const amountIn = ethers.parseEther("10");
      const expectedAmountOut = await simpleSwap.getAmountOut(
        amountIn,
        initialLiquidity,
        initialLiquidity
      );

      await expect(
        simpleSwap.connect(owner).swap0For1(amountIn, expectedAmountOut, await addr1.getAddress())
      )
        .to.emit(simpleSwap, "Swap")
        .withArgs(
          await owner.getAddress(),
          amountIn,
          0,
          0,
          expectedAmountOut,
          await addr1.getAddress()
        );

      const [reserve0, reserve1] = await simpleSwap.getReserves();
      expect(reserve0).to.equal(initialLiquidity + amountIn);
      expect(reserve1).to.equal(initialLiquidity - expectedAmountOut);
    });

    it("Should swap token1 for token0 correctly", async function () {
      const amountIn = ethers.parseEther("10");
      const expectedAmountOut = await simpleSwap.getAmountOut(
        amountIn,
        initialLiquidity,
        initialLiquidity
      );

      await expect(
        simpleSwap.connect(owner).swap1For0(amountIn, expectedAmountOut, await addr1.getAddress())
      )
        .to.emit(simpleSwap, "Swap")
        .withArgs(
          await owner.getAddress(),
          0,
          amountIn,
          expectedAmountOut,
          0,
          await addr1.getAddress()
        );

      const [reserve0, reserve1] = await simpleSwap.getReserves();
      expect(reserve0).to.equal(initialLiquidity - expectedAmountOut);
      expect(reserve1).to.equal(initialLiquidity + amountIn);
    });

    it("Should fail when output amount is less than minimum", async function () {
      const amountIn = ethers.parseEther("10");
      const expectedAmountOut = await simpleSwap.getAmountOut(
        amountIn,
        initialLiquidity,
        initialLiquidity
      );

      await expect(
        simpleSwap.connect(owner).swap0For1(
          amountIn,
          expectedAmountOut + ethers.parseEther("1"),
          await addr1.getAddress()
        )
      ).to.be.revertedWith("Insufficient output amount");
    });

    it("Should fail to swap with zero input amount", async function () {
      await expect(
        simpleSwap.connect(owner).swap0For1(0, 0, await addr1.getAddress())
      ).to.be.revertedWith("Insufficient input amount");
      await expect(
        simpleSwap.connect(owner).swap1For0(0, 0, await addr1.getAddress())
      ).to.be.revertedWith("Insufficient input amount");
    });

    it("Should fail to swap to zero address", async function () {
      const amountIn = ethers.parseEther("10");
      const expectedAmountOut = await simpleSwap.getAmountOut(
        amountIn,
        initialLiquidity,
        initialLiquidity
      );

      await expect(
        simpleSwap.connect(owner).swap0For1(amountIn, expectedAmountOut, ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid recipient");
      await expect(
        simpleSwap.connect(owner).swap1For0(amountIn, expectedAmountOut, ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid recipient");
    });

    it("Should fail to swap with insufficient liquidity", async function () {
      // Remove all liquidity to simulate insufficient reserves
      const SimpleSwap = await ethers.getContractFactory("SimpleSwap");
      const newSwap = await SimpleSwap.deploy(await token0.getAddress(), await token1.getAddress());
      await token0.connect(owner).approve(await newSwap.getAddress(), ethers.MaxUint256);
      await token1.connect(owner).approve(await newSwap.getAddress(), ethers.MaxUint256);

      const amountIn = ethers.parseEther("10");
      await expect(
        newSwap.connect(owner).swap0For1(amountIn, 0, await addr1.getAddress())
      ).to.be.revertedWith("Insufficient liquidity");
      await expect(
        newSwap.connect(owner).swap1For0(amountIn, 0, await addr1.getAddress())
      ).to.be.revertedWith("Insufficient liquidity");
    });
  });
});