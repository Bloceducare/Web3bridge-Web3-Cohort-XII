import { ethers } from "hardhat";
import { Signature } from "ethers"; // ✅ Fix for splitSignature()
const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const main = async () => {
    console.log("🚀 Starting Remove Liquidity with Permit...");
    console.log("----------------------------------");

    const USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const WETHAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    const LP_TOKEN_ADDRESS = "0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc"; // USDC-WETH LP Token
    const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    const HOLDER_ADDRESS = "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";

    // ✅ Impersonate LP Token Holder
    await helpers.impersonateAccount(HOLDER_ADDRESS);
    const signer = await ethers.getSigner(HOLDER_ADDRESS);

    console.log("✅ Impersonated LP Token Holder:", HOLDER_ADDRESS);
    console.log("----------------------------------");

    // ✅ Get Contract Instances
    const usdcContract = await ethers.getContractAt("IERC20", USDCAddress, signer);
    const lpTokenContract = await ethers.getContractAt("IERC20Permit", LP_TOKEN_ADDRESS, signer);
    const uniswapRouter = await ethers.getContractAt("IUniswap", UNIRouter, signer);

    console.log("✅ LP Token Address:", LP_TOKEN_ADDRESS);
    console.log("----------------------------------");

    // ✅ Fetch Balances Before Removal
    const usdcBalance = await usdcContract.balanceOf(HOLDER_ADDRESS);
    const lpBalance = await lpTokenContract.balanceOf(HOLDER_ADDRESS);
    console.log("💰 USDC Balance Before:", ethers.formatUnits(usdcBalance, 6));
    console.log("💰 LP Token Balance Before:", ethers.formatUnits(lpBalance, 18));

    if (lpBalance === 0n) {
        console.error("❌ No LP tokens available to remove.");
        console.log("----------------------------------");
        return;
    }

    // ✅ Get LP Token Nonce & Chain ID for Permit Signature
    const nonce = await lpTokenContract.nonces(HOLDER_ADDRESS);
    const chainId = (await ethers.provider.getNetwork()).chainId; // ✅ Fixed chainId retrieval

    console.log("🔹 LP Token Nonce:", nonce.toString());
    console.log("🔹 Chain ID:", chainId);

    // ✅ Generate Permit Signature
    const domain = {
        name: "Uniswap V2",
        version: "1",
        chainId,
        verifyingContract: LP_TOKEN_ADDRESS,
    };

    const types = {
        Permit: [
            { name: "owner", type: "address" },
            { name: "spender", type: "address" },
            { name: "value", type: "uint256" },
            { name: "nonce", type: "uint256" },
            { name: "deadline", type: "uint256" },
        ],
    };

    const deadline = Math.floor(Date.now() / 1000) + 180; // 3 minutes expiry

    const message = {
        owner: HOLDER_ADDRESS,
        spender: UNIRouter,
        value: lpBalance,
        nonce,
        deadline,
    };

    console.log("🔹 Signing Permit...");
    const signature = await signer.signTypedData(domain, types, message);

    // ✅ Fix: Use `Signature.from()` to split signature
    const { r, s, v } = Signature.from(signature);
    
    console.log("✅ Permit Signed!");
    console.log("----------------------------------");

    // ✅ Remove Liquidity With Permit
    console.log("🔹 Removing Liquidity With Permit...");

    try {
        await uniswapRouter.connect(signer).removeLiquidityWithPermit(
            USDCAddress,
            WETHAddress,
            lpBalance,
            0, // Min USDC
            0, // Min ETH
            HOLDER_ADDRESS,
            deadline,
            false, // approveMax
            v,
            r,
            s
        );
        console.log("✅ Liquidity removed successfully!");
    } catch (error: any) {
        console.error("❌ Failed to remove liquidity:", error.reason || error);
    }

    console.log("----------------------------------");
    const usdcBalanceAfter = await usdcContract.balanceOf(HOLDER_ADDRESS);
    console.log("💰 USDC Balance After:", ethers.formatUnits(usdcBalanceAfter, 6));
};

main().catch((error) => {
    console.error("❌ Unexpected Error:", error);
    process.exitCode = 1;
});
