import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const main = async () => {
    const USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const DAIAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    const HolderAddress = "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";

    // ✅ Impersonate the holder account
    await helpers.impersonateAccount(HolderAddress);
    const impersonatedSigner = await ethers.getSigner(HolderAddress);

    // ✅ Get contract instances
    const usdcContract = await ethers.getContractAt("IERC20", USDCAddress);
    const daiContract = await ethers.getContractAt("IERC20", DAIAddress);
    const uniswapRouter = await ethers.getContractAt("IUniswap", UNIRouter);

    // ✅ Log balances before swap
    const usdcBal = await usdcContract.balanceOf(impersonatedSigner.address);
    const daiBal = await daiContract.balanceOf(impersonatedSigner.address);

    console.log("----------------------------------");
    console.log("💰 USDC Balance Before Swap:", ethers.formatUnits(usdcBal, 6));
    console.log("💰 DAI Balance Before Swap:", ethers.formatUnits(daiBal, 18));
    console.log("----------------------------------");

    // ✅ Correct amounts (USDC has 6 decimals, DAI has 18 decimals)
    let swapAmt = ethers.parseUnits("50000", 6); 
    let maxAmt = ethers.parseUnits("45000", 6); 

    // ✅ Deadline (Unix timestamp, 25 mins from now)
    let deadline = Math.floor(Date.now() / 1000) + 1500;

    console.log("🔹 Approving USDC for swap...");
    await usdcContract.connect(impersonatedSigner).approve(UNIRouter, swapAmt);
    console.log("✅ USDC Approved!");

    console.log("🚀 Swapping USDC for DAI...");
    await uniswapRouter.connect(impersonatedSigner).swapTokensForExactTokens(
        swapAmt,
        maxAmt,
        [USDCAddress, DAIAddress],
        impersonatedSigner.address,
        deadline
    );
    console.log("✅ Swap Completed!");

    // ✅ Log balances after swap
    const usdcBalAfter = await usdcContract.balanceOf(impersonatedSigner.address);
    const daiBalAfter = await daiContract.balanceOf(impersonatedSigner.address);

    console.log("----------------------------------");
    console.log("💰 USDC Balance After Swap:", ethers.formatUnits(usdcBalAfter, 6));
    console.log("💰 DAI Balance After Swap:", ethers.formatUnits(daiBalAfter, 18));
    console.log("----------------------------------");
};

main().catch((error) => {
    console.error("❌ Swap Failed:", error.reason || error);
    process.exitCode = 1;
});
