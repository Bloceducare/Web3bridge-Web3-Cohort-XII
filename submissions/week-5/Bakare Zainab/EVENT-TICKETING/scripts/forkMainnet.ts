import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const main = async () => {
  const USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  const DAIAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
//   const wethAdress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

  const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

  const USDCHolder = "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";

  await helpers.impersonateAccount(USDCHolder);
  const impersonatedSigner = await ethers.getSigner(USDCHolder);


  //....................get USDC Balance.............................

  

  let usdcContract = await ethers.getContractAt('IERC20', USDCAddress);
  let daiContract = await ethers.getContractAt('IERC20', DAIAddress);


//   let holderUsdcBal = await usdcContract.balaceOf(impersonatedSigner.address);

  console.log(impersonatedSigner);

}



//   const amountOut = ethers.parseUnits("2000", 6);
//   const amountIn = ethers.parseEther("1");
//   const amountInMax = ethers.parseEther("100");


//   const amountADesired = ethers.parseUnits("20000", 6);
//   const amountBDesired = ethers.parseUnits("200000000000000000000", 18);


//   const USDC = await ethers.getContractAt("IERC20", USDCAddress);
//   const DAI = await ethers.getContractAt("IERC20", DAIAddress);
//   const WETH = await ethers.getContractAt("IERC20", wethAdress);

//   const ROUTER = await ethers.getContractAt("IUniswap", UNIRouter);

//   console.log(
//     "----------------------------geting Router-------------------------------------"
//   );

//   const approvesA = await USDC.connect(impersonatedSigner).approve(
//     UNIRouter,
//     amountADesired
//   );

//   await approvesA.wait();

//   const approveB = await DAI.connect(impersonatedSigner).approve(
//     UNIRouter,
//     amountBDesired
//   );

//   await approveB.wait();

//   console.log(
//     "---------------------Apprv B--------------------------------------------"
//   );


//   const ethBal = await impersonatedSigner.provider.getBalance(USDCHolder);
//   const wethBal = await WETH.balanceOf(impersonatedSigner.address);

//   console.log(
//     "-----------------------------------------------------------------"
//   );

//   const usdcBal = await USDC.balanceOf(impersonatedSigner.address);
//   const daiBal = await DAI.balanceOf(impersonatedSigner.address);

//   console.log(
//     "-----------------------Bal b4 adding lquidity------------------------------------------"
//   );

//   console.log("USDC Balance:", ethers.formatUnits(usdcBal, 6));
//   console.log("DAI Balance:", ethers.formatUnits(daiBal, 18));

//   console.log(
//     "-------------------------adding liquidity------------------------------------"
//   );

//   const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

//   const swapTx = await ROUTER.connect(impersonatedSigner).addLiquidity(
//     USDCAddress,
//     DAIAddress,
//     amountADesired,
//     amountBDesired,
//     0,
//     0,
//     impersonatedSigner.address,
//     deadline
//   );

//   await swapTx.wait();

//   const usdcBalAfterSwap = await USDC.balanceOf(impersonatedSigner.address);
//   const daiBalAfterSwap = await DAI.balanceOf(impersonatedSigner.address);

//   console.log(
//     "-----------------Liquidity added---------------------------------------"
//   );


//   console.log(
//     "usdc balance after adding liquidity",
//     ethers.formatUnits(usdcBalAfterSwap, 6)
//   );
//   console.log(
//     "dai balance after adding liquidity",
//     ethers.formatUnits(daiBalAfterSwap, 18)
//   );

  
// };

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});