import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const main = async () => {
    console.log("🚀 Starting Liquidity Removal Process...");
    console.log("----------------------------------");

    // ✅ Define token addresses
    const USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const DAIAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    const LP_TOKEN_ADDRESS = "0xAE461cA67B15dc8dc81CE7615e0320dA1A9aB8D5";
    const HolderAddress = "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";

    // ✅ Impersonate LP token holder
    await helpers.impersonateAccount(HolderAddress);
    const impersonatedSigner = await ethers.getSigner(HolderAddress);

    console.log("✅ Impersonated LP Token Holder:", HolderAddress);
    console.log("----------------------------------");

    // ✅ Get contract instances
    const usdcContract = await ethers.getContractAt("IERC20", USDCAddress);
    const daiContract = await ethers.getContractAt("IERC20", DAIAddress);
    const uniswapRouter = await ethers.getContractAt("IUniswap", UNIRouter);
    const lpTokenContract = await ethers.getContractAt("IERC20", LP_TOKEN_ADDRESS);

    console.log(`✅ LP Token Address: ${LP_TOKEN_ADDRESS}`);
    console.log("----------------------------------");

    // ✅ Fetch balances BEFORE removal
    const usdcBalBefore = await usdcContract.balanceOf(impersonatedSigner.address);
    const daiBalBefore = await daiContract.balanceOf(impersonatedSigner.address);
    const lpBalance = await lpTokenContract.balanceOf(impersonatedSigner.address);
    const lpDecimals = await lpTokenContract.decimals();

    console.log("💰 USDC Balance Before:", ethers.formatUnits(usdcBalBefore, 6));
    console.log("💰 DAI Balance Before:", ethers.formatUnits(daiBalBefore, 18));
    console.log("💰 LP Token Balance Before:", ethers.formatUnits(lpBalance, lpDecimals));
    console.log("----------------------------------");

    // ✅ Ensure LP balance is sufficient
    if (lpBalance === 0n) {
        console.error("❌ No LP tokens available to remove.");
        console.log("----------------------------------");
        return;
    }

    // ✅ Approve LP tokens for removal
    await lpTokenContract.connect(impersonatedSigner).approve(UNIRouter, lpBalance);
    console.log("✅ Approved LP Tokens for removal.");
    console.log("----------------------------------");

    // ✅ Remove Liquidity
    console.log("🚀 Removing Liquidity...");
    console.log("----------------------------------");

    try {
        await uniswapRouter.connect(impersonatedSigner).removeLiquidity(
            USDCAddress,
            DAIAddress,
            lpBalance,
            0, // Min amount of token A (USDC)
            0, // Min amount of token B (DAI)
            impersonatedSigner.address,
            Math.floor(Date.now() / 1000) + 60 // Expiry time (1 minute)
        );
        console.log("✅ Liquidity removed successfully.");
    } catch (err: any) {
        console.error("❌ Failed to remove liquidity:", err.reason || err);
        console.log("----------------------------------");
        return;
    }

    console.log("----------------------------------");

    // ✅ Fetch balances AFTER removal
    const usdcBalAfter = await usdcContract.balanceOf(impersonatedSigner.address);
    const daiBalAfter = await daiContract.balanceOf(impersonatedSigner.address);
    const lpBalanceAfter = await lpTokenContract.balanceOf(impersonatedSigner.address);

    console.log("💰 USDC Balance After:", ethers.formatUnits(usdcBalAfter, 6));
    console.log("💰 DAI Balance After:", ethers.formatUnits(daiBalAfter, 18));
    console.log("💰 LP Token Balance After:", ethers.formatUnits(lpBalanceAfter, lpDecimals));
    console.log("----------------------------------");
    console.log("✅ Liquidity removal process completed!");
};

// Execute the main function
main().catch((error) => {
    console.error("❌ Unexpected Error:", error);
    console.log("----------------------------------");
    process.exitCode = 1;
});
