import { ethers } from "hardhat";

const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const main = async () => {
    console.log("🚀 Starting Add Liquidity with ETH...");
    
    const USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const WethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    const UNIFactory = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
    const USDCWhale = "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";

    // 🛠️ Impersonate the USDC whale account
    await helpers.impersonateAccount(USDCWhale);
    const impersonatedSigner = await ethers.getSigner(USDCWhale);

    // 🎯 Get contract instances
    const usdcContract = await ethers.getContractAt("IERC20", USDCAddress, impersonatedSigner);
    const uniswapRouter = await ethers.getContractAt("IUniswap", UNIRouter, impersonatedSigner);
    const uniswapFactory = await ethers.getContractAt("IUniswapV2Factory", UNIFactory, impersonatedSigner);

    // 🏦 Get USDC-WETH Pair Address
    const pairAddress = await uniswapFactory.getPair(USDCAddress, WethAddress);
    if (pairAddress === ethers.ZeroAddress) {
        console.error("❌ No Uniswap Pair Found for USDC-WETH");
        return;
    }

    const pairContract = await ethers.getContractAt("IUniswapV2Pair", pairAddress, impersonatedSigner);
    const [reserveUSDC, reserveETH] = await pairContract.getReserves();

    console.log("----------------------------------");
    console.log("✅ Uniswap Pair Address:", pairAddress);
    console.log("💰 Reserve USDC:", ethers.formatUnits(reserveUSDC, 6));
    console.log("💰 Reserve ETH:", ethers.formatUnits(reserveETH, 18));
    console.log("----------------------------------");

    // 📊 Fetch balances before operation
    const usdcBal = await usdcContract.balanceOf(impersonatedSigner.address);
    const ethBal = await ethers.provider.getBalance(impersonatedSigner.address);

    console.log("💰 USDC Balance Before:", ethers.formatUnits(usdcBal, 6));
    console.log("💰 ETH Balance Before:", ethers.formatUnits(ethBal, 18));
    console.log("----------------------------------");

    // ⚖️ Adjust Liquidity Parameters Based on Pool Reserves
    const amountTokenDesired = reserveUSDC / 500n; // 🔹 Reduce liquidity size (1/500th of the pool)
    const amountETHDesired = reserveETH / 500n;
    const amountTokenMin = (amountTokenDesired * 99n) / 100n; // 🔹 1% slippage
    const amountETHMin = (amountETHDesired * 99n) / 100n;

    console.log(`🔹 Adding Liquidity: ${ethers.formatUnits(amountTokenDesired, 6)} USDC & ${ethers.formatUnits(amountETHDesired, 18)} ETH`);

    // ✅ Approve USDC for Uniswap Router
    const approvalTx = await usdcContract.connect(impersonatedSigner).approve(UNIRouter, amountTokenDesired);
    await approvalTx.wait();
    console.log("✅ Approved USDC for Uniswap Router");

    // ⏳ Set a 3-minute deadline for the transaction
    const deadline = Math.floor(Date.now() / 1000) + 180;

    // 🚀 Add Liquidity with ETH
    console.log("-------------------------- Adding Liquidity with ETH --------------------------");
    try {
        const tx = await uniswapRouter.connect(impersonatedSigner).addLiquidityETH(
            USDCAddress,
            amountTokenDesired,
            amountTokenMin,
            amountETHMin,
            impersonatedSigner.address,
            deadline,
            { value: amountETHDesired }
        );
        await tx.wait();
        console.log("✅ Liquidity added successfully!");
    } catch (err: any) {
        console.error("❌ Failed to add liquidity:", err.reason || err);
    }

    // 📊 Fetch balances after operation
    const usdcBalAfter = await usdcContract.balanceOf(impersonatedSigner.address);
    const ethBalAfter = await ethers.provider.getBalance(impersonatedSigner.address);

    console.log("----------------------------------");
    console.log("💰 USDC Balance After:", ethers.formatUnits(usdcBalAfter, 6));
    console.log("💰 ETH Balance After:", ethers.formatUnits(ethBalAfter, 18));
    console.log("----------------------------------");

    console.log("✅ Liquidity Addition Process Completed!");
};

main().catch((error) => {
    console.error("❌ Error in script:", error);
    process.exitCode = 1;
});
