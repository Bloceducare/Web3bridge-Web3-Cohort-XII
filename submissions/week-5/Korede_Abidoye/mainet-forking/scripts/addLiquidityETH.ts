import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const main = async () => {
    const tokenAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; 
    const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"; 

    const theAddressIFoundWithToken = "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";

    awat helpers.impersonateAccount(theAddressIFoundWithToken);
    const impersonatedSigner = await ethers.getSigner(theAddressIFoundWithToken);

    
    let tokenContract = await ethers.getContractAt('IERC20', tokenAddress);
    let uniswapContract = await ethers.getContractAt('IUniswapV2Router01', UNIRouter);

    
    const tokenBal = await tokenContract.balanceOf(impersonatedSigner.address);
    const ethBal = await ethers.provider.getBalance(impersonatedSigner.address);

    console.log('impersonated account token balance BA:', ethers.formatUnits(tokenBal, 6));
    console.log('impersonated account ETH balance BA:', ethers.formatEther(ethBal));

    
    const amountTokenDesired = ethers.parseUnits('1000', 6);
    const amountTokenMin = ethers.parseUnits('950', 6);
    const amountETHMin = ethers.parseEther('0.1'); 
    const to = impersonatedSigner.address;
    const deadline = await helpers.time.latest() + 3600;

    
    await tokenContract.connect(impersonatedSigner).approve(UNIRouter, amountTokenDesired);

    console.log('-------------------------- Adding liquidity with ETH -------------')

    
    await uniswapContract.connect(impersonatedSigner).addLiquidityETH(
        tokenAddress,
        amountTokenDesired,
        amountTokenMin,
        amountETHMin,
        to,
        deadline,
        {
          value: ethers.parseEther('1'),
          gasPrice: ethers.parseUnits('20', 'gwei') 
      }
    );

    console.log('-------------------------- liquidity added with ETH -------------')

    const tokenBalAfter = await tokenContract.balanceOf(impersonatedSigner.address);
    const ethBalAfter = await ethers.provider.getBalance(impersonatedSigner.address);

    console.log('impersonated account token balance AF:', ethers.formatUnits(tokenBalAfter, 6));
    console.log('impersonated account ETH balance AF:', ethers.formatEther(ethBalAfter));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});