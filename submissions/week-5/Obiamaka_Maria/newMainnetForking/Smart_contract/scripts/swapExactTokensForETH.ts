import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const main = async () => {
  // the USDC & WETH ERC20 implementation address on mainet(ethereum)
    const USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const wETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'; // wETH address
  
    const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
  
    const theAddressIFoundWithUSDCAndDAI = "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";

    await helpers.impersonateAccount(theAddressIFoundWithUSDCAndDAI);
    const impersonatedSigner = await ethers.getSigner(theAddressIFoundWithUSDCAndDAI);

    let usdcContract = await ethers.getContractAt('IERC20', USDCAddress);
    let wETHContract = await ethers.getContractAt('IERC20', wETH);
    let uniswapContract = await ethers.getContractAt('IUniswap', UNIRouter);

    const usdcBal = await usdcContract.balanceOf(impersonatedSigner.address);
    const wETHBal = await wETHContract.balanceOf(impersonatedSigner.address);

    console.log('impersonneted acct usdc bal before swap:', ethers.formatUnits(usdcBal, 6))

    console.log('impersonneted acct dai bal before swap:', ethers.formatUnits(wETHBal, 18))


    let amountIn = ethers.parseUnits('100', 6);
    let amountOutMin = ethers.parseEther('0.009');
    let deadline = await helpers.time.latest() + 2500;

    console.log('--------------- Approving swap amt ---------------')

    await usdcContract.connect(impersonatedSigner).approve(UNIRouter, amountIn);

    console.log('--------------- approved ---------------')

    console.log('--------------- swapping Exact Token For Eth ---------------')

    await uniswapContract.connect(impersonatedSigner).swapExactTokensForETH(
        amountIn,
        amountOutMin,
        [USDCAddress, wETH],
        impersonatedSigner.address,
        deadline
    )

    console.log('--------------- swapped Token For Eth  ---------------')

    const usdcBalAfter = await usdcContract.balanceOf(impersonatedSigner.address);
    const wETHBalAfter = await wETHContract.balanceOf(impersonatedSigner.address);

    console.log('impersonneted acct usdc bal AF:', ethers.formatUnits(usdcBalAfter, 6))

    console.log('impersonneted acct dai bal AF:', ethers.formatUnits(wETHBalAfter, 18));
}

  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });