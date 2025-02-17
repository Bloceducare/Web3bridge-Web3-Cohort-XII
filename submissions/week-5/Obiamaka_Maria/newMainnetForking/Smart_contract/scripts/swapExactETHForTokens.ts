import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const main = async () => {
    const WETHAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

    const USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

    const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

    const theAddressIFoundWithUSDCAndDAI = "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";

    await helpers.impersonateAccount(theAddressIFoundWithUSDCAndDAI);
    const impersonatedSigner = await ethers.getSigner(theAddressIFoundWithUSDCAndDAI);

    const wethContract = await ethers.getContractAt('IERC20', WETHAddress);
    const usdcContract = await ethers.getContractAt('IERC20', USDCAddress);
    const uniswapContract = await ethers.getContractAt('IUniswap', UNIRouter);

    const wethBal = await wethContract.balanceOf(impersonatedSigner.address);
    const usdcBal = await usdcContract.balanceOf(impersonatedSigner.address);
    const ethBal = await ethers.provider.getBalance(impersonatedSigner.address);

    console.log('Impersonated account ETH balance before swap:', ethers.formatUnits(ethBal, 18));
    console.log('Impersonated account WETH balance before swap:', ethers.formatUnits(wethBal, 18));
    console.log('Impersonated account USDC balance before swap:', ethers.formatUnits(usdcBal, 6));

    const swapAmt = ethers.parseUnits('1', 18);
    const minAmt = ethers.parseUnits('1500', 6);
    const deadline = (await helpers.time.latest()) + 1500;

    console.log('--------------- Swapping ETH FOR USDC ---------------');

    
    const tx = await uniswapContract.connect(impersonatedSigner).swapExactETHForTokens(
        minAmt, 
        [WETHAddress, USDCAddress], 
        impersonatedSigner.address,
        deadline,
        { value: swapAmt }
    );

    await tx.wait();

    console.log('--------------- Swapped ---------------');

    const wethBalAfter = await wethContract.balanceOf(impersonatedSigner.address);
    const usdcBalAfter = await usdcContract.balanceOf(impersonatedSigner.address);
    const ethBalAfter = await ethers.provider.getBalance(impersonatedSigner.address);

    console.log('Impersonated account ETH balance after swap:', ethers.formatUnits(ethBalAfter, 18));
    console.log('Impersonated account WETH balance after swap:', ethers.formatUnits(wethBalAfter, 18));
    console.log('Impersonated account USDC balance after swap:', ethers.formatUnits(usdcBalAfter, 6));
};

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});