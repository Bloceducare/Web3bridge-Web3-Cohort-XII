// scripts/deploy.ts
import { ethers } from "hardhat";

async function main() {
    // ... other code remains the same ...

    // Deploy myTestToken for TokenX and TokenY
    const Token = await ethers.getContractFactory("myTestToken");
    const tokenX = await Token.deploy("TokenX", "TX");
    await tokenX.waitForDeployment();
    const tokenXAddress = await tokenX.getAddress();
    console.log("TokenX deployed to:", tokenXAddress);

    const tokenY = await Token.deploy("TokenY", "TY");
    await tokenY.waitForDeployment();
    const tokenYAddress = await tokenY.getAddress();
    console.log("TokenY deployed to:", tokenYAddress);

    // Deploy SwapContract
    const Swap = await ethers.getContractFactory("SwapContract");
    const swapContract = await Swap.deploy(tokenXAddress, tokenYAddress);
    await swapContract.waitForDeployment();
    const swapContractAddress = await swapContract.getAddress();
    console.log("SwapContract deployed to:", swapContractAddress);

    // No need to mint tokens if they are minted in the constructor

    // Add liquidity (You might need to adjust the amounts based on what's minted in the constructor)
    await tokenX.approve(swapContractAddress, ethers.parseEther("1000"));
    await tokenY.approve(swapContractAddress, ethers.parseEther("1000"));
    const tx = await swapContract.addLiquidity(ethers.parseEther("1000"), ethers.parseEther("1000"));
    await tx.wait(); // wait for the transaction to be mined
    console.log("Liquidity added");

    // ... rest of your script
}