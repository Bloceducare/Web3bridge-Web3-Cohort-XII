const { ethers } = require("hardhat");

async function main() {
    // Deploy TokenA (ETH)
    const TokenA = await ethers.getContractFactory("TokenA");
    const tokenA = await TokenA.deploy();
    await tokenA.waitForDeployment();
    console.log(`TokenA (ETH) deployed at: ${tokenA.target}`);

    // Deploy TokenB (USDC)
    const TokenB = await ethers.getContractFactory("TokenB");
    const tokenB = await TokenB.deploy();
    await tokenB.waitForDeployment();
    console.log(`TokenB (USDC) deployed at: ${tokenB.target}`);

    // Deploy Swap Contract
    const Swap = await ethers.getContractFactory("Swap");
    const swap = await Swap.deploy(tokenA.target, tokenB.target);
    await swap.waitForDeployment();
    console.log(`Swap contract deployed at: ${swap.target}`);

    // Get signer
    const [owner] = await ethers.getSigners();

    // Transfer liquidity to Swap contract
    await tokenA.transfer(swap.target, ethers.parseUnits("5000", 18)); // 5000 ETH
    await tokenB.transfer(swap.target, ethers.parseUnits("2500", 18)); // 2500 USDC
    console.log("Liquidity added to Swap contract.");

    // Approve Swap contract to spend TokenA (ETH)
    await tokenA.approve(swap.target, ethers.parseUnits("100", 18));
    console.log("Approved Swap contract to spend 100 ETH.");

    console.log("Deployment complete! 🎉");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

