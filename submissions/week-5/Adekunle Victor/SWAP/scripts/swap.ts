const { ethers } = require("hardhat");

async function main() {
    // Get signers
    const [owner] = await ethers.getSigners();

    console.log(`Deploying contracts using address: ${owner.address}`);

    // Deploy TokenX
    const TokenX = await ethers.getContractFactory("TokenX");
    const tokenX = await TokenX.deploy();
    await tokenX.waitForDeployment();
    console.log(`TokenX deployed at: ${tokenX.target}`);

    // Deploy TokenY
    const TokenY = await ethers.getContractFactory("TokenY");
    const tokenY = await TokenY.deploy();
    await tokenY.waitForDeployment();
    console.log(`TokenY deployed at: ${tokenY.target}`);

    // Deploy Swap Contract
    const Swap = await ethers.getContractFactory("Swap");
    const swapContract = await Swap.deploy(tokenX.target, tokenY.target);
    await swapContract.waitForDeployment();
    console.log(`Swap Contract deployed at: ${swapContract.target}`);

    // Check initial token balances (already minted to owner during deployment)
    const initialSupply = ethers.parseEther("10000"); // 10,000 tokens each (as per constructor)
    console.log(`Owner's TokenX Balance: ${ethers.formatEther(await tokenX.balanceOf(owner.address))}`);
    console.log(`Owner's TokenY Balance: ${ethers.formatEther(await tokenY.balanceOf(owner.address))}`);

    // Add liquidity
    const amountX = ethers.parseEther("50"); // 50 TokenX
    const amountY = ethers.parseEther("50"); // 50 TokenY

    console.log("Approving tokens for liquidity...");
    await tokenX.approve(swapContract.target, amountX);
    await tokenY.approve(swapContract.target, amountY);

    console.log("Adding liquidity...");
    await swapContract.addLiquidity(amountX, amountY);
    console.log(`Liquidity added successfully!`);
    console.log(`ReserveX: ${ethers.formatEther(await swapContract.reserveX())}`);
    console.log(`ReserveY: ${ethers.formatEther(await swapContract.reserveY())}`);

    // Perform a swap (TokenX -> TokenY)
    const swapAmountIn = ethers.parseEther("10"); // Swap 10 TokenX for TokenY
    console.log("Approving tokens for swap...");
    await tokenX.approve(swapContract.target, swapAmountIn);

    console.log("Swapping TokenX for TokenY...");
    await swapContract.swap(tokenX.target, swapAmountIn);

    // Check updated balances and reserves
    console.log(`Owner's TokenX Balance: ${ethers.formatEther(await tokenX.balanceOf(owner.address))}`);
    console.log(`Owner's TokenY Balance: ${ethers.formatEther(await tokenY.balanceOf(owner.address))}`);
    console.log(`Swap Contract ReserveX: ${ethers.formatEther(await swapContract.reserveX())}`);
    console.log(`Swap Contract ReserveY: ${ethers.formatEther(await swapContract.reserveY())}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});