// import { MulticoinProviderPlugin } from "ethers";
import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers")

const main = async () => {
    const daiAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    const wethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    const poolDaiAddress = "0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11";
    const liquidityProvider = "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";

    await helpers.impersonateAccount(liquidityProvider);

    const impersonateAccount = await ethers.getSigner(liquidityProvider)

    let daiContract = await ethers.getContractAt('IERC20', daiAddress)
    let wethContract = await ethers.getContractAt('IERC20', wethAddress)
    let uniswapContract = await ethers.getContractAt('IUniswapV2Router', UNIRouter)
    let poolContract = await ethers.getContractAt('IERC20', poolDaiAddress)

    console.log("\n-----------------let fucking go-----------------")

    const daibal = await daiContract.balanceOf(impersonateAccount)
    const ethBal = await ethers.provider.getBalance(impersonateAccount)
    const poolbalOfDai = await daiContract.balanceOf(poolDaiAddress)
    const poolbalofWeth = await wethContract.balanceOf(poolDaiAddress)
    // const lpBalance = await poolContract.balanceOf(liquidityProvider);
    const lpBalanceBefore = await poolContract.balanceOf(liquidityProvider);
    console.log("\n\n-----------------befor adding liquidity -----------------")

    console.log("before impersonated dai balance:" + " " + ethers.formatUnits(daibal, 18))
    console.log("before weth impersonated eth balance" + " " + ethers.formatUnits(ethBal, 18))
    console.log("before pool dai balance" + ethers.formatUnits(poolbalOfDai, 18))
    console.log("before pool eth balance" + ethers.formatUnits(poolbalofWeth, 18))
    console.log("Before Adding Liquidity - LP Balance:", ethers.formatUnits(lpBalanceBefore, 18));


    // function addLiquidityETH(
    //     address token,
    //     uint amountTokenDesired,
    //     uint amountTokenMin,
    //     uint amountETHMin,
    //     address to,
    //     uint deadline
    // ) 
    const amtATokenDesired = ethers.parseUnits("401924", 18)
    let quoteB = await uniswapContract.quote(amtATokenDesired, poolbalOfDai, poolbalofWeth)
    const amtBtokenDesired = quoteB;
    const amtAMin = ethers.parseUnits("4900000", 18)
    const amtBMin = amtBtokenDesired - ethers.parseUnits("100", 18)

    console.log("Quote B", ethers.formatUnits(quoteB, 18))

    const deadline = await helpers.time.latest() + 600;

    // await daiContract.connect(impersonateAccount).approve(UNIRouter, amtATokenDesired)

    const approveTx = await daiContract.connect(impersonateAccount).approve(UNIRouter, amtATokenDesired);
    await approveTx.wait();
    console.log("Approved Uniswap Router to spend DAI");
    await uniswapContract.connect(impersonateAccount).addLiquidityETH(daiAddress, amtATokenDesired, amtAMin, amtBMin, liquidityProvider, deadline, { value: amtBtokenDesired })

    console.log("\n-----------------After adding liquidity -----------------")


    console.log("after impersonated dai balance:" + " " + ethers.formatUnits(daibal, 18))
    console.log("after weth impersonated eth balance" + " " + ethers.formatUnits(ethBal, 18))
    console.log("after pool dai balance" + ethers.formatUnits(poolbalOfDai, 18))
    console.log("after pool eth balance" + ethers.formatUnits(poolbalofWeth, 18))
    const lpBalanceAfter = await poolContract.balanceOf(liquidityProvider);

    console.log("After Adding Liquidity - LP Balance:", ethers.formatUnits(lpBalanceAfter, 18));
    // u



}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})