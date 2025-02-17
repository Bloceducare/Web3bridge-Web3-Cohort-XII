import { ethers } from "hardhat";

async function main() {
    console.log("\n🚀 Starting deployment process...");
    
    const signer = await ethers.provider.getSigner();
    console.log(`📍 Owner address: ${await signer.getAddress()}`);
    
    console.log("\n📦 Deploying tokens...");
    const tokenAFactory = await ethers.deployContract("Token", ["TokenA", "TKA"]);
    const tokenBFactory = await ethers.deployContract("Token", ["TokenB", "TKB"]);

    const tokenA = await tokenAFactory.waitForDeployment();
    const tokenB = await tokenBFactory.waitForDeployment();

    console.log(`💎 TokenA deployed to: ${tokenA.target}`);
    console.log(`💎 TokenB deployed to: ${tokenB.target}`);


    console.log("\n🔄 Deploying swap contract...");
    const swapFactory = await ethers.getContractFactory("Swap");
    const swap = await swapFactory.deploy(tokenA.target, tokenB.target);
    console.log(`Swap contract deployed to: ${swap.target}`);

    console.log("\n💰 Minting initial tokens...");
    await tokenA.mint(swap.target, ethers.parseUnits("1000", 18));
    await tokenB.mint(swap.target, ethers.parseUnits("1000", 18));
    await tokenA.mint(signer.address, ethers.parseUnits("500", 18));
    
    console.log("Initial token balances:");
    console.log(`Swap contract TokenA: ${await tokenA.balanceOf(swap.target)}`);
    console.log(`Swap contract TokenB: ${await tokenB.balanceOf(swap.target)}`);
    console.log(`User1 TokenA: ${await tokenA.balanceOf(signer.address)}`);
    console.log(`User1 TokenB: ${await tokenB.balanceOf(signer.address)}`);

    console.log("\n🔄 Performing swap...");
    await tokenA.approve(swap.target, ethers.parseUnits("100", 18));
    console.log("Approved 100 TokenA for swap");
    
    await swap.swapToken(ethers.parseUnits("100", 18), tokenA.target);
    console.log("Swap executed");

    console.log("\n📊 Final token balances:");
    console.log(`Swap contract TokenA: ${await tokenA.balanceOf(swap.target)}`);
    console.log(`Swap contract TokenB: ${await tokenB.balanceOf(swap.target)}`);
    console.log(`User1 TokenA: ${await tokenA.balanceOf(signer.address)}`);
    console.log(`User1 TokenB: ${await tokenB.balanceOf(signer.address)}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });