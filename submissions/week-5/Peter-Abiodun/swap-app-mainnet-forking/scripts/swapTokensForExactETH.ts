import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const main = async () => {
    const USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const wethAdress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

    const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

    const USDCHolder = "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";

    await helpers.impersonateAccount(USDCHolder);
    const impersonatedSigner = await ethers.getSigner(USDCHolder);

    const amountOut = ethers.parseUnits("300000000000", 6);
    const amountIn = ethers.parseEther("1");

    const USDC = await ethers.getContractAt("IERC20", USDCAddress);
    const WETH = await ethers.getContractAt("IERC20", wethAdress);

    const ROUTER = await ethers.getContractAt("IUniswap", UNIRouter);

    const approveTx = await USDC.connect(impersonatedSigner).approve(UNIRouter, amountOut);
    await approveTx.wait();

    const ethBal = await impersonatedSigner.provider.getBalance(USDCHolder);
    const wethBal = await WETH.balanceOf(impersonatedSigner.address);
    const usdcBal = await USDC.balanceOf(impersonatedSigner.address);

    console.log("ETH Balance:", ethers.formatUnits(ethBal, 18));
    console.log("WETH Balance:", ethers.formatUnits(wethBal, 18));
    console.log("USDC Balance:",ethers.formatUnits(usdcBal, 6));


    const deadline = Math.floor(Date.now() / 1000) + (60 * 10);

    const swapTx = await ROUTER.connect(impersonatedSigner).swapTokensForExactETH(
        amountOut,
        amountIn,
        [USDCAddress, wethAdress],
        impersonatedSigner.address,
        deadline
    );


    await swapTx.wait();


    // Uncomment this if you are using the swap tokens for ETH
    const ethBalAfterSwap = await impersonatedSigner.provider.getBalance(USDCHolder);
    const wethBalAfterSwap = await WETH.balanceOf(impersonatedSigner.address);
    const usdcBalAfterSwap = await USDC.balanceOf(impersonatedSigner.address);

    console.log("-----------------------------------------------------------------")

    // Uncomment this if you are using the swap tokens for ETH
    console.log("eth balance after swap", ethers.formatUnits(ethBalAfterSwap, 18));
    console.log("weth balance after swap", ethers.formatUnits(wethBalAfterSwap, 18));
    console.log("usdc balance after swap", ethers.formatUnits(usdcBalAfterSwap, 6));
    
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});