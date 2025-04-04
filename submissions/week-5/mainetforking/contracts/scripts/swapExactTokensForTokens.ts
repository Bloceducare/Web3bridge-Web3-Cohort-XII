import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const main = async () => {
    
    const USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const DAIAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
   
  
    const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
  
    const theAddressIFoundWithUSDCAndDAI = "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";

  
    await helpers.impersonateAccount(theAddressIFoundWithUSDCAndDAI);
    const impersonatedSigner = await ethers.getSigner(theAddressIFoundWithUSDCAndDAI);

    let usdcContract = await ethers.getContractAt('IERC20', USDCAddress);
    let daiContract = await ethers.getContractAt('IERC20', DAIAddress);
    let uniswapContract = await ethers.getContractAt('IUniswap', UNIRouter);

    const usdcBal = await usdcContract.balanceOf(impersonatedSigner.address);
    const daiBal = await daiContract.balanceOf(impersonatedSigner.address);

    console.log('impersonneted acct usdc bal before swap:', ethers.formatUnits(usdcBal, 6))

    console.log('impersonneted acct dai bal before swap:', ethers.formatUnits(daiBal, 18))

    let swapAmt = ethers.parseUnits('50000', 6);
    let minAmt = ethers.parseUnits('45000', 18);
    let deadline = await helpers.time.latest() + 1500;

    console.log('--------------- Approving swap amt ---------------')

    await usdcContract.connect(impersonatedSigner).approve(UNIRouter, swapAmt);

    console.log('--------------- approved ---------------')

    console.log('--------------- swapping ---------------')

    await uniswapContract.connect(impersonatedSigner).swapExactTokensForTokens(
        swapAmt,
        minAmt,
        [USDCAddress, DAIAddress],
        impersonatedSigner.address,
        deadline
    )

    console.log('--------------- swapped ---------------')

    const usdcBalAfter = await usdcContract.balanceOf(impersonatedSigner.address);
    const daiBalAfter = await daiContract.balanceOf(impersonatedSigner.address);

    console.log('impersonneted acct usdc bal AF:', ethers.formatUnits(usdcBalAfter, 6))

    console.log('impersonneted acct dai bal AF:', ethers.formatUnits(daiBalAfter, 18))

}

  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });