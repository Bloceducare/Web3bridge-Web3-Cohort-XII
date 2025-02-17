import { ethers } from "hardhat";

const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const main = async () => {
    
    const USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const DAIAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    const WethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    const theAddressIFoundWithUSDCAndDAI = "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";

  
    await helpers.impersonateAccount(theAddressIFoundWithUSDCAndDAI);
    const impersonatedSigner = await ethers.getSigner(theAddressIFoundWithUSDCAndDAI);

    let usdcContract = await ethers.getContractAt('IERC20', USDCAddress);
    let daiContract = await ethers.getContractAt('IERC20', DAIAddress);
    let uniswapContract = await ethers.getContractAt('IUniswap', UNIRouter);
    let wethContract = await ethers.getContractAt("IERC20", WethAddress)

    // let holderUsdcBal = await usdcContract.balanceOf(impersonatedSigner.address);

    const usdcBal = await usdcContract.balanceOf(impersonatedSigner.address);
    const daiBal = await daiContract.balanceOf(impersonatedSigner.address);
    const wethBal = await wethContract.balanceOf(impersonatedSigner.address);

    console.log('impersonneted acct usdc bal BA:', ethers.formatUnits(usdcBal, 6))

    console.log('impersonneted acct dai bal BA:', ethers.formatUnits(daiBal, 18))

    console.log('impersonneted acct weth bal BA:', ethers.formatUnits(wethBal, 18))

    let AmtADesired = ethers.parseUnits('100000', 6);
    let AmtBDesired = ethers.parseUnits('100000', 18);
    const amountOutMin = ethers.parseUnits("1", 6);
    const ethAmount = ethers.parseEther("20");

    // let AmtAMin = ethers.parseUnits('99000', 6);
    // let AmtBMin = ethers.parseUnits('99000', 18);

    let deadline = await helpers.time.latest() + 500;


    await usdcContract.connect(impersonatedSigner).approve(UNIRouter, AmtADesired);
    await daiContract.connect(impersonatedSigner).approve(UNIRouter, AmtBDesired);
    await wethContract.connect(impersonatedSigner).approve(UNIRouter, amountOutMin);

    console.log('-------------------------- swapping exact eth for tokens -------------')

    await uniswapContract.connect(impersonatedSigner).swapExactETHForTokens(
        amountOutMin,
        [WethAddress, USDCAddress],
        impersonatedSigner.address,
        deadline,
        { value: ethAmount }
    )

    console.log('-------------------------- swapping exact eth for tokens ended -------------')

    const usdcBalAfter = await usdcContract.balanceOf(impersonatedSigner.address);
    const daiBalAfter = await daiContract.balanceOf(impersonatedSigner.address);
    const wethAfter = await wethContract.balanceOf(impersonatedSigner.address);


    console.log('impersonneted acct usdc bal AF:', ethers.formatUnits(usdcBalAfter, 6))

    console.log('impersonneted acct dai bal AF:', ethers.formatUnits(daiBalAfter, 18))
    console.log('impersonneted acct weth bal AF:', ethers.formatUnits(wethAfter, 18))  

}

  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });