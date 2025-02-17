import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-network-helpers");

async function main() {
    const ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"; // Uniswap V2 Router
    const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F"; // DAI
    const TOKEN_HOLDER = "0x55FE002aefF02F77364de339a1292923A15844B8";

    await helpers.impersonateAccount(TOKEN_HOLDER);
    const impersonatedSigner = await ethers.getSigner(TOKEN_HOLDER);

    const ROUTER = await ethers.getContractAt("IUniswapV2Router", ROUTER_ADDRESS, impersonatedSigner);
    const USDC_Contract = await ethers.getContractAt("IERC20", USDC, impersonatedSigner);
    const DAI_Contract = await ethers.getContractAt("IERC20", DAI, impersonatedSigner);

    // Amount of DAI to receive
    const amountOut = ethers.parseUnits("10", 18); // 10 DAI

    // Get the required USDC amount using getAmountsIn
    const path = [USDC, DAI];
    const amountsIn = await ROUTER.getAmountsIn(amountOut, path);
    const amountInMax = amountsIn[0];

    console.log(`Exact USDC required: ${ethers.formatUnits(amountInMax, 6)}`);

    // Check balances before swap
    const usdcBalanceBefore = await USDC_Contract.balanceOf(impersonatedSigner.address);
    const daiBalanceBefore = await DAI_Contract.balanceOf(impersonatedSigner.address);
    console.log(`USDC balance before: ${ethers.formatUnits(usdcBalanceBefore, 6)}`);
    console.log(`DAI balance before: ${ethers.formatUnits(daiBalanceBefore, 18)}`);

    if (usdcBalanceBefore < amountInMax) {
        console.error("ERROR: Insufficient USDC balance!");
        return;
    }

    const to = impersonatedSigner.address;
    const deadline = Math.floor(Date.now() / 1000) + (60 * 10); // 10-minute deadline

    // Approve Router to spend the required USDC
    await USDC_Contract.approve(ROUTER_ADDRESS, amountInMax);

    console.log("Swapping USDC for DAI...");

    // Perform the swap
    const tx = await ROUTER.swapTokensForExactTokens(
        amountOut,   // Exact DAI we want
        amountInMax, // Required USDC
        path,
        to,
        deadline
    );

    await tx.wait();
    console.log("Swap complete!");

    // Check balances after swap
    const usdcBalanceAfter = await USDC_Contract.balanceOf(impersonatedSigner.address);
    const daiBalanceAfter = await DAI_Contract.balanceOf(impersonatedSigner.address);
    console.log("=========================================================");
    console.log(`USDC balance after: ${ethers.formatUnits(usdcBalanceAfter, 6)}`);
    console.log(`DAI balance after: ${ethers.formatUnits(daiBalanceAfter, 18)}`);
}

// Execute script
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
