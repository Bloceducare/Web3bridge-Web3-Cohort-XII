const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("UniswapLike Contract", function () {
  let UniswapLike, uniswap, TokenA, TokenB, tokenA, tokenB, owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    TokenA = await ethers.getContractFactory("ERC20Mock");
    TokenB = await ethers.getContractFactory("ERC20Mock");
    tokenA = await TokenA.deploy("Token A", "TKA", 1000000);
    tokenB = await TokenB.deploy("Token B", "TKB", 1000000);

    UniswapLike = await ethers.getContractFactory("UniswapLike");
    uniswap = await UniswapLike.deploy(tokenA.address, tokenB.address);

    await tokenA.transfer(addr1.address, 10000);
    await tokenB.transfer(addr1.address, 10000);
  });

  it("Should add liquidity", async function () {
    await tokenA.connect(addr1).approve(uniswap.address, 1000);
    await tokenB.connect(addr1).approve(uniswap.address, 1000);

    await expect(uniswap.connect(addr1).addLiquidity(1000, 1000))
      .to.emit(uniswap, "LiquidityAdded")
      .withArgs(addr1.address, 1000, 1000);
  });

  it("Should remove liquidity", async function () {
    await tokenA.connect(addr1).approve(uniswap.address, 1000);
    await tokenB.connect(addr1).approve(uniswap.address, 1000);
    await uniswap.connect(addr1).addLiquidity(1000, 1000);

    await expect(uniswap.connect(addr1).removeLiquidity(500, 500))
      .to.emit(uniswap, "LiquidityRemoved")
      .withArgs(addr1.address, 500, 500);
  });

  it("Should swap Token A for Token B", async function () {
    await tokenA.connect(addr1).approve(uniswap.address, 1000);
    await tokenB.connect(addr1).approve(uniswap.address, 1000);
    await uniswap.connect(addr1).addLiquidity(1000, 1000);

    await tokenA.connect(addr1).approve(uniswap.address, 500);
    await expect(uniswap.connect(addr1).swapAForB(500))
      .to.emit(uniswap, "Swap")
      .withArgs(addr1.address, 500, ethers.BigNumber.from("497"), true);
  });

  it("Should swap Token B for Token A", async function () {
    await tokenA.connect(addr1).approve(uniswap.address, 1000);
    await tokenB.connect(addr1).approve(uniswap.address, 1000);
    await uniswap.connect(addr1).addLiquidity(1000, 1000);

    await tokenB.connect(addr1).approve(uniswap.address, 500);
    await expect(uniswap.connect(addr1).swapBForA(500))
      .to.emit(uniswap, "Swap")
      .withArgs(addr1.address, 500, ethers.BigNumber.from("497"), false);
  });
});
