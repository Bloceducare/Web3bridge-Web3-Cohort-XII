import { ethers } from "hardhat";

const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const main = async () => {
    
    const USDCAddress = process.env.USDCAddress!;
    const DAIAddress = process.env.DAIAddress!;
   
    const UNIRouter = process.env.UNIRouter!;
  
    const HolderAddress = process.env.HolderAddress!;

    await helpers.impersonateAccount(HolderAddress);
    const impersonatedSigner = await ethers.getSigner(HolderAddress);

    const usdcContract = await ethers.getContractAt("IERC20", USDCAddress);
    const daiContract = await ethers.getContractAt("IERC20", DAIAddress);
    const uniswapRouter = await ethers.getContractAt("IUniswap", UNIRouter);

    const usdcBal = await usdcContract.balanceOf(impersonatedSigner.address);
    const daiBal = await daiContract.balanceOf(impersonatedSigner.address);

    console.log("USDC Balance Before:", ethers.formatUnits(usdcBal, 6));
    console.log("DAI Balance Before:", ethers.formatUnits(daiBal, 18));

    const AmtA = ethers.parseUnits("99000", 6);
    const reserveA = ethers.parseUnits("100000", 6);
    const reserveB = ethers.parseUnits("100000", 18);

    await usdcContract.connect(impersonatedSigner).approve(UNIRouter, AmtA);
    await daiContract.connect(impersonatedSigner).approve(UNIRouter, reserveB);

    console.log("Approvals Done");

    console.log("-------------------------- 📊 Quoting Liquidity -------------");

    const quoteAmount = await uniswapRouter.quote(AmtA, reserveA, reserveB);

    console.log("Quote Result:", ethers.formatUnits(quoteAmount, 18));

    console.log("-------------------------- ✅ Quote Done -------------");

    const usdcBalAfter = await usdcContract.balanceOf(impersonatedSigner.address);
    const daiBalAfter = await daiContract.balanceOf(impersonatedSigner.address);

    console.log("USDC Balance After:", ethers.formatUnits(usdcBalAfter, 6));
    console.log("DAI Balance After:", ethers.formatUnits(daiBalAfter, 18));
};

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
