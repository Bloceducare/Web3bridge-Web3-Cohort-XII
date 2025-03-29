import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const main = async () => {
    const USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const DAIAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    const theAddressIFoundWithUSDCAndDAI = "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";

    await helpers.impersonateAccount(theAddressIFoundWithUSDCAndDAI);
    const impersonatedSigner = await ethers.getSigner(theAddressIFoundWithUSDCAndDAI);

    let usdcContract = await ethers.getContractAt('IERC20', USDCAddress);
    let daiContract = await ethers.getContractAt('IERC20', DAIAddress);
    let uniswapContract = await ethers.getContractAt('IUniswap', UNIRouter);

    const pairAddress = await uniswapContract.getPair(USDCAddress, DAIAddress);
    let lpTokenContract = await ethers.getContractAt('IERC20', pairAddress);


    const lpBalance = await lpTokenContract.balanceOf(impersonatedSigner.address);
    console.log("LP Token Balance:", ethers.formatUnits(lpBalance, 18));

    if (lpBalance == 0) {
        console.log("No liquidity to remove!");
        return;
    }


    await lpTokenContract.connect(impersonatedSigner).approve(UNIRouter, lpBalance);

    let minUSDC = ethers.parseUnits('90000', 6);
    let minDAI = ethers.parseUnits('90000', 18);

    let deadline = await helpers.time.latest() + 500;

    console.log("---------------- Removing Liquidity ----------------");

    await uniswapContract.connect(impersonatedSigner).removeLiquidity(
        USDCAddress,
        DAIAddress,
        lpBalance,
        minUSDC,
        minDAI,
        impersonatedSigner.address,
        deadline
    );

    console.log("---------------- Liquidity Removed ----------------");

    const usdcBalAfter = await usdcContract.balanceOf(impersonatedSigner.address);
    const daiBalAfter = await daiContract.balanceOf(impersonatedSigner.address);

    console.log("Impersonated USDC Balance After:", ethers.formatUnits(usdcBalAfter, 6));
    console.log("Impersonated DAI Balance After:", ethers.formatUnits(daiBalAfter, 18));
};

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
