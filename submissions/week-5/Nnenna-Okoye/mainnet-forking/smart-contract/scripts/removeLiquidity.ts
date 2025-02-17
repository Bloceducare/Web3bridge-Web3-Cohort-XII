import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const main = async () => {
    console.log('------------- Starting Liquidity Operations -------------');
    
    const USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const DAIAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    const theAddressIFoundWithUSDCAndDAI = "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";
 
    console.log('Initializing contracts...');
    let usdcContract = await ethers.getContractAt('IERC20', USDCAddress);
    let daiContract = await ethers.getContractAt('IERC20', DAIAddress);
    let uniswapContract = await ethers.getContractAt('IUniswapV2Router', UNIRouter);

    console.log('Impersonating account...');
    await helpers.impersonateAccount(theAddressIFoundWithUSDCAndDAI);
    const impersonatedSigner = await ethers.getSigner(theAddressIFoundWithUSDCAndDAI);

    // Set amounts for adding liquidity
    let AmtADesired = ethers.parseUnits('100000', 6);  
    let AmtBDesired = ethers.parseUnits('100000', 18); 
    let AmtAMin = ethers.parseUnits('6000', 6);        
    let AmtBMin = ethers.parseUnits('5000', 18);       
    let deadline = await helpers.time.latest() + 1500;

    // Get initial balances 
    const initialUsdcBal = await usdcContract.balanceOf(impersonatedSigner.address);
    const initialDaiBal = await daiContract.balanceOf(impersonatedSigner.address);

    console.log('------------- Initial Balances -------------');
    console.log('Initial USDC Balance:', ethers.formatUnits(initialUsdcBal, 6));
    console.log('Initial DAI Balance:', ethers.formatUnits(initialDaiBal, 18));

    // Approve tokens for adding liquidity
    console.log('------------- Approving Tokens -------------');
    await usdcContract.connect(impersonatedSigner).approve(UNIRouter, AmtADesired);
    await daiContract.connect(impersonatedSigner).approve(UNIRouter, AmtBDesired);
    console.log('Tokens approved for router');

    // Add liquidity
    console.log('------------- Adding Liquidity -------------');
    const addLiquidityTx = await uniswapContract.connect(impersonatedSigner).addLiquidity(
        USDCAddress,
        DAIAddress,
        AmtADesired,
        AmtBDesired,
        AmtAMin,
        AmtBMin,
        impersonatedSigner.address,
        deadline
    );
    await addLiquidityTx.wait();
    console.log('Liquidity added successfully');

    // Get balances after adding liquidity
    const postAddUsdcBal = await usdcContract.balanceOf(impersonatedSigner.address);
    const postAddDaiBal = await daiContract.balanceOf(impersonatedSigner.address);

    console.log('------------- Balances After Adding Liquidity -------------');
    console.log('USDC Balance after adding:', ethers.formatUnits(postAddUsdcBal, 6));
    console.log('DAI Balance after adding:', ethers.formatUnits(postAddDaiBal, 18));

    // Get LP token information
    const factoryAddress = await uniswapContract.factory();
    const factory = await ethers.getContractAt("IUniswapV2Factory", factoryAddress);
    const pairAddress = await factory.getPair(USDCAddress, DAIAddress);
    const LPToken = await ethers.getContractAt("IERC20", pairAddress);

    // Get LP token balance
    let liquidity = await LPToken.balanceOf(impersonatedSigner.address);
    console.log('------------- LP Token Balance -------------');
    console.log('LP tokens received:', liquidity.toString());

    // Approve LP tokens for removal
    console.log('------------- Preparing to Remove Liquidity -------------');
    await LPToken.connect(impersonatedSigner).approve(UNIRouter, liquidity);
    console.log('LP tokens approved for removal');

    // Set lower minimums for removal
    let RemoveAmtAMin = ethers.parseUnits('1', 6);  
    let RemoveAmtBMin = ethers.parseUnits('1', 18); 

    // Remove liquidity
    console.log('------------- Removing Liquidity -------------');
    const removeLiquidityTx = await uniswapContract.connect(impersonatedSigner).removeLiquidity(
        USDCAddress,                                                                    
        DAIAddress,
        liquidity,
        RemoveAmtAMin,
        RemoveAmtBMin,
        impersonatedSigner.address,
        deadline
    );
    await removeLiquidityTx.wait();
    console.log('Liquidity removed successfully');

    // Get final balances
    const finalUsdcBal = await usdcContract.balanceOf(impersonatedSigner.address);
    const finalDaiBal = await daiContract.balanceOf(impersonatedSigner.address);
    const finalLiquidity = await LPToken.balanceOf(impersonatedSigner.address);

    console.log('------------- Final Balances -------------');
    console.log('Final USDC Balance:', ethers.formatUnits(finalUsdcBal, 6));
    console.log('Final DAI Balance:', ethers.formatUnits(finalDaiBal, 18));
    console.log('Final LP Token Balance:', finalLiquidity.toString());

    console.log('------------- Summary -------------');
    console.log('USDC Change:', ethers.formatUnits(finalUsdcBal - initialUsdcBal, 6));
    console.log('DAI Change:', ethers.formatUnits(finalDaiBal - initialDaiBal, 18));
};

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});