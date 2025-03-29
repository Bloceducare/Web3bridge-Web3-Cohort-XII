const { ethers } = require("hardhat");

const main = async () => {
    const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    const WETH = await ethers.getContractAt("IUniswapV2Router02", UNIRouter).then(router => router.WETH());
    const DAIAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";

    const [signer] = await ethers.getSigners();
    
    const uniswap = await ethers.getContractAt("IUniswapV2Router02", UNIRouter);
    
    const amountOutMin = ethers.parseUnits("10", 18); // Minimum expected DAI
    const deadline = Math.floor(Date.now() / 1000) + 1200; // 20 minutes from now
    const path = [WETH, DAIAddress];

    console.log("🔄 Swapping ETH for DAI...");
    await uniswap.connect(signer).swapExactETHForTokens(
        amountOutMin,
        path,
        signer.address,
        deadline,
        { value: ethers.parseEther("0.1") } // Sending 0.1 ETH
    );

    console.log("✅ Swap complete!");
};

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
