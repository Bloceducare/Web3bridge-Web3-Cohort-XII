import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import hre, { ethers } from "hardhat";
import { expect } from "chai";

describe("Swap", () => {
  const deployContracts = async () => {
    let [owner] = await hre.ethers.getSigners();

    let erc20 = await hre.ethers.getContractFactory("MyToken");

    let tokenA = await erc20.deploy("tokenA", "TA");

    let tokenB = await erc20.deploy("tokenB", "TB");

    let swap = await hre.ethers.getContractFactory("Swap");

    let deployedSwap = await swap.deploy(tokenA.target, tokenB.target);

    return { deployedSwap, tokenA, tokenB, owner };
  };

  describe("swapTokenAToB", () => {
    it("should swap token A to tokenB", async () => {
      let { deployedSwap, tokenA, tokenB, owner } = await loadFixture(
        deployContracts
      );

      await tokenB.transfer(
        deployedSwap.target,
        hre.ethers.parseUnits("100000", 18)
      );

      let balOfOwnerBeforeSwapInTokenA = await tokenA.balanceOf(owner);
      let balOfOwnerBeforeSwapInTokenB = await tokenB.balanceOf(owner);

      let balOfContractBeforeSwapInTokenA = await tokenA.balanceOf(
        deployedSwap.target
      );
      let balOfContractBeforeSwapInTokenB = await tokenB.balanceOf(
        deployedSwap.target
      );

      console.log("owner tokenA bal:", balOfOwnerBeforeSwapInTokenA);
      console.log("owner tokenB bal:", balOfOwnerBeforeSwapInTokenB);

      console.log("swapContract tokenA bal:", balOfContractBeforeSwapInTokenA);
      console.log("SwapContract tokenB bal:", balOfContractBeforeSwapInTokenB);

      console.log(
        "-------------------------Approving---------------------------------"
      );
      await tokenA.approve(
        deployedSwap.target,
        hre.ethers.parseUnits("100000", 18)
      );

      console.log(
        "-------------------------Swapping---------------------------------"
      );
      await deployedSwap.swapTokenAToTokenB(
        hre.ethers.parseUnits("100000", 18)
      );

      let balOfOwnerAfterSwapInTokenA = await tokenA.balanceOf(owner);
      let balOfOwnerAfterSwapInTokenB = await tokenB.balanceOf(owner);

      let balOfContractAfterSwapInTokenA = await tokenA.balanceOf(
        deployedSwap.target
      );
      let balOfContractAfterSwapInTokenB = await tokenB.balanceOf(
        deployedSwap.target
      );

      console.log("owner tokenA bal:", balOfOwnerAfterSwapInTokenA);
      console.log("owner tokenB bal:", balOfOwnerAfterSwapInTokenB);

      console.log("swapContract tokenA bal:", balOfContractAfterSwapInTokenA);
      console.log("SwapContract tokenB bal:", balOfContractAfterSwapInTokenB);
    });
  });
});
