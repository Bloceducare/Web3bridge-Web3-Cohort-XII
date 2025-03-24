import { time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const main = async () => {
  const wethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
  const daiAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F"

  const router = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"

  const fundsHolder = "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621"

  await helpers.impersonateAccount(fundsHolder);
  const impersonatedSigner = await ethers.getSigner(fundsHolder);

  let ethContract = await ethers.getContractAt("IERC20", wethAddress)
  let daiContract = await ethers.getContractAt("IERC20", daiAddress)
  let uniswapContract = await ethers.getContractAt("IUniswap", router)

  const holderETHBal = await ethContract.balanceOf(impersonatedSigner.address)
  const holderDAIBal = await daiContract.balanceOf(impersonatedSigner.address)

  console.log("impersonator's ETH balance before swapping => ", holderETHBal);
  console.log("impersonator's dai balance before swapping => ", holderDAIBal);

  const amountOut = ethers.parseEther("5");
  const amountInMax = ethers.parseEther("15000");

  console.log("--------------------- Approving -------------------------");

  await daiContract.connect(impersonatedSigner).approve(router, amountInMax)

  console.log("--------------------- Approved -------------------------");

  console.log("--------------------- Swapping -------------------------");
  
  await uniswapContract.connect(impersonatedSigner).swapTokensForExactETH(
    amountOut, 
    amountInMax, 
    [daiAddress, wethAddress], 
    fundsHolder, 
    await time.latest()+300
  );

  console.log("--------------------- Swapped -------------------------");

  const ethBalAfter = await ethContract.balanceOf(impersonatedSigner.address)

  const daiBalAfter = await daiContract.balanceOf(impersonatedSigner.address)

  console.log("impersonated ETH bal after swapping => ", ethers.formatEther(ethBalAfter));

  console.log("impersonated dai bal after swapping => ", ethers.formatEther(daiBalAfter));
  
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});