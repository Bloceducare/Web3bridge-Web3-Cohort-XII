import { ethers } from "hardhat";

const main = async () => {
    const [signer] = await ethers.getSigners();

    const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";    
    const DAIAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    
    const uniswapContract = await ethers.getContractAt('IUniswap', UNIRouter);
    const daiContract = await ethers.getContractAt('IERC20', DAIAddress);

    const amountOut = ethers.parseUnits("1000", 18); 
    const path = [await uniswapContract.WETH(), DAIAddress]; 
    const to = signer.address; 
    const deadline = Math.floor(Date.now() / 1000) + 600; 

    const ethBalance = await ethers.provider.getBalance(signer.address);
    console.log('Your ETH balance:', ethers.formatEther(ethBalance));

    const amountsIn = await uniswapContract.getAmountsIn(amountOut, path);
    const maxEthNeeded = amountsIn[0];
    console.log('Maximum ETH needed for 1000 DAI:', ethers.formatEther(maxEthNeeded));

    const ethToSend = maxEthNeeded * 110n / 100n;

    if (ethBalance < ethToSend) {
        throw new Error("Insufficient ETH balance in your account");
    }

    const daiBalanceBefore = await daiContract.balanceOf(signer.address);
    console.log('DAI balance before swap:', ethers.formatUnits(daiBalanceBefore, 18));

    console.log('-------------------------- Performing swap -------------');
    try {
        const tx = await uniswapContract.connect(signer).swapETHForExactTokens(
            amountOut,
            path,
            to,
            deadline,
            { 
                value: ethToSend, 
                gasPrice: ethers.parseUnits("50", "gwei"), 
                gasLimit: 200000 
            }
        );
        const receipt = await tx.wait();
        console.log('Swap completed successfully. Transaction hash:', receipt.transactionHash);
    } catch (error) {
        console.error('Error during swap:', error.message);
        if (error.data) {
            console.error('Error data:', error.data);
        }
        throw error;
    }

    const daiBalanceAfter = await daiContract.balanceOf(signer.address);
    console.log('DAI balance after swap:', ethers.formatUnits(daiBalanceAfter, 18));

    const ethBalanceAfter = await ethers.provider.getBalance(signer.address);
    console.log('ETH balance after swap:', ethers.formatEther(ethBalanceAfter));
};

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});