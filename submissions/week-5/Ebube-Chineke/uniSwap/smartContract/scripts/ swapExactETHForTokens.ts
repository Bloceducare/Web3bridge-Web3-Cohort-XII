import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const main = async () => {
    
    const WETHAddress = "0xC02aaa39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // WETH address
    const DAIAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";  // Token to buy (DAI)

    const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"; // Uniswap V2 Router

    const theAddressIFoundWithETH = "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621"; // Impersonate an account with ETH

    await helpers.impersonateAccount(theAddressIFoundWithETH);
    const impersonatedSigner = await ethers.getSigner(theAddressIFoundWithETH);

    let daiContract = await ethers.getContractAt('IERC20', DAIAddress);
    let uniswapContract = await ethers.getContractAt('IUniswap', UNIRouter);

    const daiBalBefore = await daiContract.balanceOf(impersonatedSigner.address);
    console.log('Impersonated account DAI balance before swap:', ethers.formatUnits(daiBalBefore, 18));

    let ethAmount = ethers.parseUnits('1', 18); // Amount of ETH to swap
    let minTokensOut = ethers.parseUnits('1500', 18); // Minimum DAI expected (for slippage protection)
    let deadline = await helpers.time.latest() + 1500;

    console.log('--------------- Swapping ETH for DAI ---------------');

    await uniswapContract.connect(impersonatedSigner).swapExactETHForTokens(
        minTokensOut,
        [WETHAddress, DAIAddress], // Path: Swap WETH -> DAI
        impersonatedSigner.address,
        deadline,
        { value: ethAmount } // ETH sent with the transaction
    );

    console.log('--------------- Swap Completed ---------------');

    const daiBalAfter = await daiContract.balanceOf(impersonatedSigner.address);
    console.log('Impersonated account DAI balance after swap:', ethers.formatUnits(daiBalAfter, 18));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});