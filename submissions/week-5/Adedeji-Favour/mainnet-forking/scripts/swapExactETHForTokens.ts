import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const main = async () => {
    const USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const wethAdress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

    const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

    const ETHHolder = "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";

    await helpers.impersonateAccount(ETHHolder);
    const impersonatedSigner = await ethers.getSigner(ETHHolder);

    const USDCContract = await ethers.getContractAt("IERC20", USDCAddress)
    const WETHContract = await ethers.getContractAt("IERC20", wethAdress)
    const UNIRouterContract = await ethers.getContractAt("IUniswap", UNIRouter)

    const usdcBal = await USDCContract.balanceOf(ETHHolder)
    const ethBal = await WETHContract.balanceOf(ETHHolder)

    console.log("Impersanator's usdc balance before swapping => ", ethers.formatUnits(usdcBal, 6) );
    console.log("Impersanator's ETH balance before swapping => ", ethers.formatUnits(ethBal, 18));

    const amountOutMin = ethers.parseUnits("2500", 6);
    const exactETHAmt = ethers.parseEther("1");
    // const deadline = await helpers.time.latest() + 2000;

    console.log("---------------------- Approving swap amount -----------------------------");
    
    await WETHContract.connect(impersonatedSigner).approve(UNIRouter, exactETHAmt)

    console.log("---------------------- Approved -----------------------------");

    console.log("---------------------- Swapping ETH -----------------------------");

    await UNIRouterContract.connect(impersonatedSigner).swapExactETHForTokens(
      amountOutMin,
      [wethAdress, USDCAddress],
      impersonatedSigner.address,
      await helpers.time.latest() + 2000,
      { value: exactETHAmt }
    )

    console.log("---------------------- Swapped -----------------------------");

    const usdcBalAfter = await USDCContract.balanceOf(impersonatedSigner.address)
    const ethBalAfter = await WETHContract.balanceOf(impersonatedSigner.address)

    console.log('impersonneted acct usdc bal AF:', ethers.formatUnits(usdcBalAfter, 6))

    console.log('impersonneted acct eth bal AF:', ethers.formatUnits(ethBalAfter, 18))


    // const USDC = await ethers.getContractAt("IERC20", USDCAddress);
    // const WETH = await ethers.getContractAt("IERC20", wethAdress);

    // const ROUTER = await ethers.getContractAt("IUniswap", UNIRouter);

    // const approveTx = await USDC.connect(impersonatedSigner).approve(UNIRouter, amountOut);
    // await approveTx.wait();

    // const ethBal = await impersonatedSigner.provider.getBalance(USDCHolder);
    // const wethBal = await WETH.balanceOf(impersonatedSigner.address);
    // const usdcBal = await USDC.balanceOf(impersonatedSigner.address);

    // console.log("ETH Balance before swap => ", ethers.formatUnits(ethBal, 18));
    // console.log("WETH Balance before swap => ", ethers.formatUnits(wethBal, 18));
    // console.log("USDC Balance before swap => ",ethers.formatUnits(usdcBal, 6));

    // const swapTx = await ROUTER.connect(impersonatedSigner).swapTokensForExactETH(
    //     amountOut,
    //     amountIn,
    //     [USDCAddress, wethAdress],
    //     impersonatedSigner.address,
    //     deadline
    // );


    // await swapTx.wait();


    // // Uncomment this if you are using the swap tokens for ETH
    // const ethBalAfterSwap = await impersonatedSigner.provider.getBalance(ETHHolder);
    // const wethBalAfterSwap = await WETH.balanceOf(impersonatedSigner.address);
    // const usdcBalAfterSwap = await USDC.balanceOf(impersonatedSigner.address);

    // console.log("-----------------------------------------------------------------")

    // // Uncomment this if you are using the swap tokens for ETH
    // console.log("eth balance after swap", ethers.formatUnits(ethBalAfterSwap, 18));
    // console.log("weth balance after swap", ethers.formatUnits(wethBalAfterSwap, 18));
    // console.log("usdc balance after swap", ethers.formatUnits(usdcBalAfterSwap, 6));
    
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});