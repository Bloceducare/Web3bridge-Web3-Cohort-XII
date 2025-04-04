import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const main = async () => {
    // Address of the token you're swapping FROM (e.g., USDC)
    const USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    
    // Address of the Uniswap Router
    const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    
    // An account with USDC to perform the swap
    const theAddressIFoundWithUSDC = "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";

    // Impersonate the account for testing
    await helpers.impersonateAccount(theAddressIFoundWithUSDC);
    const impersonatedSigner = await ethers.getSigner(theAddressIFoundWithUSDC);

    // Get contract instances for USDC and Uniswap Router
    let usdcContract = await ethers.getContractAt('IERC20', USDCAddress);
    let uniswapContract = await ethers.getContractAt('IUniswapV2Router01', UNIRouter);

    // Check balances before the swap
    const usdcBal = await usdcContract.balanceOf(impersonatedSigner.address);
    const ethBal = await ethers.provider.getBalance(impersonatedSigner.address);

    console.log('Impersonated account USDC balance before swap:', ethers.formatUnits(usdcBal, 6));
    console.log('Impersonated account ETH balance before swap:', ethers.formatEther(ethBal));

    // Define the amounts for the swap
    // Define the amounts for the swap
    let amountOut = ethers.parseEther('1'); // 1 ETH in wei
    let amountInMax = ethers.parseUnits('5000', 6); // 5000 USDC max
    
      // Get WETH address from the Uniswap contract
      const wethAddress = await uniswapContract.WETH();
    
      let path = [USDCAddress, wethAddress];
      let deadline = (await helpers.time.latest()) + 3600; // add an hour in seconds

    console.log('--------------- Approving USDC ---------------')
    // Approve the router to spend USDC
    await usdcContract.connect(impersonatedSigner).approve(UNIRouter, amountInMax);
    console.log('--------------- Approved ---------------')

    console.log('--------------- Swapping ---------------')
    // Perform the swap
    await uniswapContract.connect(impersonatedSigner).swapTokensForExactETH(
        amountOut,
        amountInMax,
        path,
        impersonatedSigner.address,
        deadline
    );
    console.log('--------------- Swapped ---------------')

    // Check balances after the swap
    const usdcBalAfter = await usdcContract.balanceOf(impersonatedSigner.address);
    const ethBalAfter = await ethers.provider.getBalance(impersonatedSigner.address);

    console.log('Impersonated account USDC balance after swap:', ethers.formatUnits(usdcBalAfter, 6));
    console.log('Impersonated account ETH balance after swap:', ethers.formatEther(ethBalAfter));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});