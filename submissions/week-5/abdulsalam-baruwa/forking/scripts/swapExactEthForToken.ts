import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const main = async () => {
    
    const WETHAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    const DAIAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
   
  
    const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
  
    const theAddressIFoundWithWETHAndDAI = "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";

  
    await helpers.impersonateAccount(theAddressIFoundWithWETHAndDAI);
    const impersonatedSigner = await ethers.getSigner(theAddressIFoundWithWETHAndDAI);

    let WETHContract = await ethers.getContractAt('IERC20', WETHAddress);
    let daiContract = await ethers.getContractAt('IERC20', DAIAddress);
    let uniswapContract = await ethers.getContractAt('IUniswap', UNIRouter);

    const WETHBal = await WETHContract.balanceOf(impersonatedSigner.address);
    const daiBal = await daiContract.balanceOf(impersonatedSigner.address);

    console.log('impersonneted acct WETH bal before swap:', ethers.formatUnits(WETHBal, 6))

    console.log('impersonneted acct dai bal before swap:', ethers.formatUnits(daiBal, 18))

    let swapAmt = ethers.parseUnits('1', 18);
    let minAmt = ethers.parseUnits('2000', 18);
    let deadline = await helpers.time.latest() + 1500;

    console.log('--------------- Approving swap amt ---------------')

    await WETHContract.connect(impersonatedSigner).approve(UNIRouter, swapAmt);

    console.log('--------------- approved ---------------')

    console.log('--------------- swapping ---------------')

    await uniswapContract.connect(impersonatedSigner).swapExactETHForTokens(
        minAmt,
        [WETHAddress, DAIAddress],
        impersonatedSigner.address,
        deadline,
        {value: ethers.parseUnits('1', 18)}
    )

    console.log('--------------- swapped ---------------')

    const WETHBalAfter = await WETHContract.balanceOf(impersonatedSigner.address);
    const daiBalAfter = await daiContract.balanceOf(impersonatedSigner.address);

    console.log('impersonneted acct WETH bal AF:', ethers.formatUnits(WETHBalAfter, 6))

    console.log('impersonneted acct dai bal AF:', ethers.formatUnits(daiBalAfter, 18))

}

  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });