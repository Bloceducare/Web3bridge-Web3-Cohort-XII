import { ethers } from "hardhat"; 
const netUtils = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const deployRemoveLiquidity = async () => {
    const tokenA = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const tokenB = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    const swapRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    const liquidityHolder = "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";

    const tokenAContract = await ethers.getContractAt('IERC20', tokenA);
    const tokenBContract = await ethers.getContractAt('IERC20', tokenB);
    const routerContract = await ethers.getContractAt('IUniswapV2Router02', swapRouter);

    await netUtils.impersonateAccount(liquidityHolder);
    const signer = await ethers.getSigner(liquidityHolder);

    let minTokenA = ethers.parseUnits('6000', 6);
    let minTokenB = ethers.parseUnits('5000', 18);
    let expiry = await netUtils.time.latest() + 1000;

    const factoryAddr = await routerContract.factory();
    const factory = await ethers.getContractAt("IUniswapV2Factory", factoryAddr);
    const pairAddr = await factory.getPair(tokenA, tokenB);
    const liquidityToken = await ethers.getContractAt("IERC20", pairAddr);

    let currentLiquidity = await liquidityToken.balanceOf(signer.address);
    console.log('Initial Liquidity:', currentLiquidity);

    console.log('Executing Liquidity Removal...');
    await routerContract.connect(signer).removeLiquidity(
        tokenA,
        tokenB,
        currentLiquidity,
        minTokenA,
        minTokenB,
        signer.address,
        expiry
    );

    console.log('Liquidity Removed Successfully');
    const tokenABalance = await tokenAContract.balanceOf(signer.address);
    const tokenBBalance = await tokenBContract.balanceOf(signer.address);
    console.log('Token A Balance After:', ethers.formatUnits(tokenABalance, 6));
    console.log('Token B Balance After:', ethers.formatUnits(tokenBBalance, 18));
}

deployRemoveLiquidity().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
