import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-network-helpers");

async function main() {
    const ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"; // Uniswap V2 Router
    const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    const WETH = "0xC02aaa39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // Wrapped ETH
    const TOKEN_HOLDER = "0x55FE002aefF02F77364de339a1292923A15844B8"; // Address holding DAI/USDC

    await helpers.impersonateAccount(TOKEN_HOLDER);
    const impersonatedSigner = await ethers.getSigner(TOKEN_HOLDER);

    // Amount of ETH to receive (e.g., 0.01 ETH)
    const amountOut = ethers.parseUnits("0.01", 18); 

    // Creating contract instances
    const ROUTER = await ethers.getContractAt(
        [
            "function getAmountsIn(uint amountOut, address[] calldata path) external view returns (uint[] memory amounts)",
            "function swapTokensForExactETH(uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)"
        ],
        ROUTER_ADDRESS,
        impersonatedSigner
    );

    const DAI_Contract = await ethers.getContractAt("IERC20", DAI, impersonatedSigner);
    const USDC_Contract = await ethers.getContractAt("IERC20", USDC, impersonatedSigner);

    // Choose which token to swap (USDC or DAI)
    const inputToken = DAI; // Change to USDC if swapping USDC instead
    const TokenContract = DAI_Contract; // Change to USDC_Contract if swapping USDC
    const decimals = 18; // Use 6 for USDC

    // Define path (token -> WETH)
    const path = [inputToken, WETH];

    // Fetch the required amount of input tokens (DAI or USDC)
    const amountsIn = await ROUTER.getAmountsIn(amountOut, path);
    const amountInMax = amountsIn[0];

    console.log(`Required ${inputToken} for 0.01 ETH: ${ethers.formatUnits(amountInMax, decimals)}`);

    // Check balance
    const tokenBalance = await TokenContract.balanceOf(impersonatedSigner.address);
    console.log(`Balance: ${ethers.formatUnits(tokenBalance, decimals)} ${inputToken}`);

    if (tokenBalance < amountInMax) {
        console.error("ERROR: Insufficient balance!");
        return;
    }

    const to = impersonatedSigner.address;
    const deadline = Math.floor(Date.now() / 1000) + 600; // 10-minute deadline

    // Approve Router to spend the required token amount
    await TokenContract.approve(ROUTER_ADDRESS, amountInMax);

    console.log("Swapping tokens for ETH...");

    // Execute swap
    const tx = await ROUTER.swapTokensForExactETH(
        amountOut,  // Exact ETH we want
        amountInMax, // Max input token we're willing to spend
        path,
        to,
        deadline
    );

    await tx.wait();
    console.log("Swap complete!");
}

// Execute script
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
