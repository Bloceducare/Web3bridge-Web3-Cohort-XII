import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const main = async () => {
  const USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  const DAIAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
  const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

  const USDCHolder = "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";

  await helpers.impersonateAccount(USDCHolder);
  const impersonatedSigner = await ethers.getSigner(USDCHolder);

  const USDC = await ethers.getContractAt("IERC20", USDCAddress);
  const DAI = await ethers.getContractAt("IERC20", DAIAddress);
  const ROUTER = await ethers.getContractAt("IUniswapV2Router01", UNIRouter);

  console.log("Getting Pair Address for Uniswap Router...");
  const factoryAddress = await ROUTER.factory();
  const factory = await ethers.getContractAt("IUniswapV2Factory", factoryAddress);

  const pairAddress = await factory.getPair(USDCAddress, DAIAddress);
  const LPToken = await ethers.getContractAt("IERC20", pairAddress);


  const liquidityBF = await LPToken.balanceOf(impersonatedSigner.address);
  console.log("Liquidity Token Balance BF Burn:", liquidityBF);

  console.log("Approving LP tokens to be burnt");

  await LPToken.connect(impersonatedSigner).approve(UNIRouter, liquidityBF);

  const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

  console.log(".....................Removing Liquidity . . . .");
  const tx = await ROUTER.connect(impersonatedSigner).removeLiquidity(
    USDCAddress,
    DAIAddress,
    liquidityBF,
    0,
    0,
    impersonatedSigner.address,
    deadline
  );
  await tx.wait();

  console.log("...............removeLiquidity executed!........................", tx.hash);

  const liquidityAF = await LPToken.balanceOf(impersonatedSigner.address);

  console.log("..................Liquidity Token Balance AF Burn..................:", liquidityAF);

};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});