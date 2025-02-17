import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const main = async () => {
  const USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  const WETHAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

  const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

  const theAddressIFoundWithUSDCAndDAI =
    "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";

  await helpers.impersonateAccount(theAddressIFoundWithUSDCAndDAI);
  const impersonatedSigner = await ethers.getSigner(
    theAddressIFoundWithUSDCAndDAI
  );

  let usdcContract = await ethers.getContractAt("IERC20", USDCAddress);
  let wethContract = await ethers.getContractAt("IERC20", WETHAddress);
  let uniswapContract = await ethers.getContractAt("IUniswap", UNIRouter);

  const usdcBal = await usdcContract.balanceOf(impersonatedSigner.address);
  const daiBal = await wethContract.balanceOf(impersonatedSigner.address);

  console.log(
    "impersonneted acct usdc bal BA:",
    ethers.formatUnits(usdcBal, 6)
  );

  console.log("impersonneted acct weth bal BA:", ethers.formatUnits(daiBal, 18));

  let AmtAin = ethers.parseUnits("1000", 6);
  let AmtBoutMin = ethers.parseEther("0.04");

  let deadline = (await helpers.time.latest()) + 2500;

  await usdcContract
    .connect(impersonatedSigner)
    .approve(UNIRouter, AmtAin);
  await wethContract.connect(impersonatedSigner).approve(UNIRouter, AmtBoutMin);

  console.log("-------------------------- Swapping... -------------");

  await uniswapContract
    .connect(impersonatedSigner)
    .swapExactTokensForETHSupportingFeeOnTransferTokens(
      AmtAin,
      AmtBoutMin,
      [USDCAddress, WETHAddress],
      impersonatedSigner.address,
      deadline
    );

  console.log("-------------------------- Swap completed -------------");

  const usdcBalAfter = await usdcContract.balanceOf(impersonatedSigner.address);
  const wethBalAfter = await wethContract.balanceOf(impersonatedSigner.address);

  console.log(
    "impersonneted acct usdc bal AF:",
    ethers.formatUnits(usdcBalAfter, 6)
  );

  console.log(
    "impersonneted acct weth bal AF:",
    ethers.formatUnits(wethBalAfter, 18)
  );
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
