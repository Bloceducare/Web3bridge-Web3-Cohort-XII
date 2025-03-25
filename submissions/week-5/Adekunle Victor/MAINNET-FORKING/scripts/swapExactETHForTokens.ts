import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const main = async () => {
    const USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const DAIAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    const wethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    const impersonatedAccount = "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621"; 

    // Impersonate the account
    await helpers.impersonateAccount(impersonatedAccount);
    const impersonatedSigner = await ethers.getSigner(impersonatedAccount);

    // Get contract instances
    const usdcContract = await ethers.getContractAt("IERC20", USDCAddress);
    
    const uniswapContract = await ethers.getContractAt("IUniswapV2Router", UNIRouter);

    // Check balances before swap
    const usdcBal = await usdcContract.balanceOf(impersonatedSigner.address);
    const ethBal = await ethers.provider.getBalance(impersonatedSigner.address);

    console.log("USDC Balance before swap:", ethers.formatUnits(usdcBal, 6));
    console.log("ETH Balance before swap:", ethers.formatUnits(ethBal, 18));

    // Define swap parameters
    const amountOutMin = ethers.parseUnits("5000", 6); // Minimum USDC to receive
    const deadline = (await helpers.time.latest()) + 3000;
    const value = ethers.parseEther("2"); // 2 ETH to swap
    const path = [wethAddress, USDCAddress]; 

    console.log("--------------- Swapping ETH for USDC ---------------");
    

    // Perform the swap
    await uniswapContract.connect(impersonatedSigner).swapExactETHForTokens(
        amountOutMin,
        path,
        impersonatedSigner.address,
        deadline,
        { value } 
    );

    console.log("--------------- Swap Completed ---------------");

    // Check balances after swap
    const usdcBalAfter = await usdcContract.balanceOf(impersonatedSigner.address);
    const ethBalAfter = await ethers.provider.getBalance(impersonatedSigner.address)

    console.log("USDC Balance after swap:", ethers.formatUnits(usdcBalAfter, 6));
    console.log("WETH Balance after swap:", ethers.formatUnits(ethBalAfter, 18));
};

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
