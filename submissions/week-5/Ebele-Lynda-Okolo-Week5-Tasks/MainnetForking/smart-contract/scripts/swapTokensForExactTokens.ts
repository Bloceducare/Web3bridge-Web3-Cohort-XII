import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const main = async () => {
    const USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const DAIAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    const impersonatedAccount = "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";

    await helpers.impersonateAccount(impersonatedAccount);
    const impersonatedSigner = await ethers.getSigner(impersonatedAccount);

    let usdcContract = await ethers.getContractAt("IERC20", USDCAddress);
    let daiContract = await ethers.getContractAt("IERC20", DAIAddress);
    let uniswapContract = await ethers.getContractAt("IUniswapV2Router01", UNIRouter);

    const usdcBal = await usdcContract.balanceOf(impersonatedSigner.address);
    const daiBal = await daiContract.balanceOf(impersonatedSigner.address);

    console.log("Impersonated account USDC balance before swap:", ethers.formatUnits(usdcBal, 6));
    console.log("Impersonated account DAI balance before swap:", ethers.formatUnits(daiBal, 18));

    let amountOut = ethers.parseUnits("45000", 18); // Exact amount of DAI to receive
    let amountInMax = ethers.parseUnits("50000", 6); // Maximum amount of USDC to spend
    let deadline = await helpers.time.latest() + 1500;

    console.log("--------------- Approving USDC ---------------");
    await usdcContract.connect(impersonatedSigner).approve(UNIRouter, amountInMax);
    console.log("--------------- Approved ---------------");

    console.log("--------------- Swapping USDC for exact DAI ---------------");
    await uniswapContract.connect(impersonatedSigner).swapTokensForExactTokens(
        amountOut,
        amountInMax,
        [USDCAddress, DAIAddress],
        impersonatedSigner.address,
        deadline
    );
    console.log("--------------- Swap completed ---------------");

    const usdcBalAfter = await usdcContract.balanceOf(impersonatedSigner.address);
    const daiBalAfter = await daiContract.balanceOf(impersonatedSigner.address);

    console.log("Impersonated account USDC balance after swap:", ethers.formatUnits(usdcBalAfter, 6));
    console.log("Impersonated account DAI balance after swap:", ethers.formatUnits(daiBalAfter, 18));
};

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});