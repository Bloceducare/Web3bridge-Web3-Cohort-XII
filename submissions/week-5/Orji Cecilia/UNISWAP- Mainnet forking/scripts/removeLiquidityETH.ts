import { ethers } from "hardhat";

const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const main = async () => {
    console.log("🚀 Starting Remove Liquidity with ETH...");
    console.log("----------------------------------");

    // ✅ Define Addresses
    const USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const WethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    const UNIFactory = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
    const LPTokenHolder = "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";

    // ✅ Impersonate LP Token Holder
    await helpers.impersonateAccount(LPTokenHolder);
    const signer = await ethers.getSigner(LPTokenHolder);
    console.log("✅ Impersonated LP Token Holder:", LPTokenHolder);
    console.log("----------------------------------");

    // ✅ Get Uniswap Contracts
    const usdcContract = await ethers.getContractAt("IERC20", USDCAddress, signer);
    const uniswapRouter = await ethers.getContractAt("IUniswap", UNIRouter, signer);
    const uniswapFactory = await ethers.getContractAt("IUniswapV2Factory", UNIFactory, signer);

    // ✅ Get LP Token Address
    const lpTokenAddress = await uniswapFactory.getPair(USDCAddress, WethAddress);
    if (lpTokenAddress === ethers.ZeroAddress) {
        console.error("❌ No Uniswap Pair Found for USDC-WETH");
        return;
    }

    const lpTokenContract = await ethers.getContractAt("IERC20", lpTokenAddress, signer);
    console.log("✅ LP Token Address:", lpTokenAddress);
    console.log("----------------------------------");

    // 📊 Fetch Balances BEFORE Removal
    const lpBalance = await lpTokenContract.balanceOf(signer.address);
    const usdcBalBefore = await usdcContract.balanceOf(signer.address);
    const ethBalBefore = await ethers.provider.getBalance(signer.address);

    console.log("💰 USDC Balance Before:", ethers.formatUnits(usdcBalBefore, 6));
    console.log("💰 ETH Balance Before:", ethers.formatUnits(ethBalBefore, 18));
    console.log("💰 LP Token Balance Before:", ethers.formatUnits(lpBalance, 18));
    console.log("----------------------------------");

    // ✅ Ensure LP Balance is Sufficient
    if (lpBalance === 0n) {
        console.error("❌ No LP tokens available to remove.");
        return;
    }

    // ⚖️ Remove only 30% of LP Tokens to Avoid "INSUFFICIENT_A_AMOUNT"
    const removeAmount = lpBalance * 30n / 100n;
    if (removeAmount === 0n) {
        console.error("❌ Remove Amount Too Small. Try Adding More Liquidity.");
        return;
    }

    // ✅ Approve LP Tokens for Uniswap Router
    const approvalTx = await lpTokenContract.connect(signer).approve(UNIRouter, removeAmount);
    await approvalTx.wait();
    console.log("✅ Approved LP Tokens for Uniswap Router");
    console.log("----------------------------------");

    // ⏳ Set Deadline (3 Minutes Expiry)
    const deadline = Math.floor(Date.now() / 1000) + 180;

    // 🚀 Remove Liquidity with ETH
    console.log("-------------------------- Removing Liquidity with ETH --------------------------");
    try {
        const tx = await uniswapRouter.connect(signer).removeLiquidityETH(
            USDCAddress,
            removeAmount,
            0, // Min USDC (set to 0 to allow flexibility)
            0, // Min ETH (set to 0 to allow flexibility)
            signer.address,
            deadline
        );
        await tx.wait();
        console.log("✅ Liquidity Removed Successfully!");
    } catch (err: any) {
        console.error("❌ Failed to remove liquidity:", err.reason || err);
        return;
    }

    // 📊 Fetch Balances AFTER Removal
    const lpBalanceAfter = await lpTokenContract.balanceOf(signer.address);
    const usdcBalAfter = await usdcContract.balanceOf(signer.address);
    const ethBalAfter = await ethers.provider.getBalance(signer.address);

    console.log("----------------------------------");
    console.log("💰 USDC Balance After:", ethers.formatUnits(usdcBalAfter, 6));
    console.log("💰 ETH Balance After:", ethers.formatUnits(ethBalAfter, 18));
    console.log("💰 LP Token Balance After:", ethers.formatUnits(lpBalanceAfter, 18));
    console.log("----------------------------------");

    console.log("✅ Liquidity Removal Process Completed!");
};

// Execute the script
main().catch((error) => {
    console.error("❌ Unexpected Error:", error);
    process.exitCode = 1;
});
