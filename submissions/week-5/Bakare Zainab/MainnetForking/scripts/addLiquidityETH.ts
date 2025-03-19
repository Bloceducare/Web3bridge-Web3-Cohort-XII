import hre, { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const main = async () => {

    
    const USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    // const DAIAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    
    const wethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    const poolAddress = "0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc";
    
    const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    
    const theAddressIFoundWithUSDCAndDAI = "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";
    
    
    await helpers.impersonateAccount(theAddressIFoundWithUSDCAndDAI);
    const impersonatedSigner = await ethers.getSigner(theAddressIFoundWithUSDCAndDAI);
    
    let usdcContract = await hre.ethers.getContractAt('IERC20', USDCAddress, impersonatedSigner);
    let wethContract = await hre.ethers.getContractAt('IERC20', wethAddress, impersonatedSigner);
    let uniswapContract = await hre.ethers.getContractAt('IUniswapV2Router01', UNIRouter, impersonatedSigner);
    let poolContract = await hre.ethers.getContractAt('IERC20', poolAddress, impersonatedSigner);
    
    
    // let holderUsdcBal = await usdcContract.balanceOf(impersonatedSigner.address);
    
    const usdcBal = await usdcContract.balanceOf(impersonatedSigner.address);
    const ethBal = await hre.ethers.provider.getBalance(theAddressIFoundWithUSDCAndDAI);
    
    
    
    const poolUsdcBal = await usdcContract.balanceOf(poolAddress);
    const poolwethBal = await wethContract.balanceOf(poolAddress);
    
    const liquidityBefore = await poolContract.balanceOf(impersonatedSigner.address);

    console.log ('......................Okay..................................')

    console.log('Pool acct usdc bal Before adding liquidity:', ethers.formatUnits(poolUsdcBal, 6))
    console.log('Pool acct weth bal Before adding liquidity:', ethers.formatUnits(poolwethBal, 18))
    console.log('\n\n\nimpersonated acct usdc bal BA:', ethers.formatUnits(usdcBal, 6))
    console.log('impersonated acct eth bal BA:', ethers.formatUnits(ethBal, 18))
    console.log ('liquidity balance before adding liquidity:', ethers.formatUnits(liquidityBefore, 18));

    let AmtADesired = ethers.parseUnits('10', 18);

    let QuoteB = await uniswapContract.quote(AmtADesired, poolwethBal, poolUsdcBal);
    let AmtBDesired = QuoteB;

    console.log ('Quote B:', ethers.formatUnits(QuoteB, 6));    
    
    

    let AmtAMin = ethers.parseUnits('9', 18);
    let AmtBMin = AmtBDesired - ethers.parseUnits ('100', 6);

    let deadline = await helpers.time.latest() + 1500;

    await usdcContract.connect(impersonatedSigner).approve(UNIRouter, AmtBDesired);

     console.log('\n-------------------------- Adding liquidity ETH -------------')

    await uniswapContract.connect(impersonatedSigner).addLiquidityETH(
        USDCAddress,
        AmtBDesired,
        AmtBMin,
        AmtAMin,
        theAddressIFoundWithUSDCAndDAI,
        deadline,
        {value: AmtADesired}
    );

    console.log('\n\n-------------------------- liquidityETH Added -------------')

    const usdcBalAfter = await usdcContract.balanceOf(impersonatedSigner.address);
    const ethBalAfter = await hre.ethers.provider.getBalance(theAddressIFoundWithUSDCAndDAI);

    const poolUsdcBalAfter = await usdcContract.balanceOf(poolAddress);
    const poolWethBalAfter = await usdcContract.balanceOf(poolAddress);
    const liquidity = await poolContract.balanceOf(impersonatedSigner.address);

    console.log('impersonneted acct usdc bal AF:', ethers.formatUnits(poolUsdcBalAfter, 6))
    console.log('impersonneted acct usdc bal AF:', ethers.formatUnits(poolWethBalAfter, 18))

    console.log('impersonneted acct usdc bal AF:', ethers.formatUnits(usdcBalAfter, 6));

    console.log('impersonneted acct dai bal AF:', ethers.formatUnits(ethBalAfter, 18));

    console.log('\nimpersonneted acct dai bal AF:', ethers.formatUnits(liquidity, 18));


}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


