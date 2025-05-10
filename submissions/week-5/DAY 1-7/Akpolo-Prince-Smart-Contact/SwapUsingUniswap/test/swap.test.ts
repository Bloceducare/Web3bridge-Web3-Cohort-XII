const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Swap Contract", function () {
    let owner, addr1, tokenA, tokenB, swap;

    before(async function () {
        [owner, addr1] = await ethers.getSigners();

        // Deploy TokenA (ETH)
        const TokenA = await ethers.getContractFactory("TokenA");
        tokenA = await TokenA.deploy();
        await tokenA.waitForDeployment();

        // Deploy TokenB (USDC)
        const TokenB = await ethers.getContractFactory("TokenB");
        tokenB = await TokenB.deploy();
        await tokenB.waitForDeployment();

        // Deploy Swap Contract
        const Swap = await ethers.getContractFactory("Swap");
        swap = await Swap.deploy(tokenA.target, tokenB.target);
        await swap.waitForDeployment();

        // Transfer liquidity to Swap contract
        await tokenA.transfer(swap.target, ethers.parseUnits("5000", 18));  // 5000 ETH
        await tokenB.transfer(swap.target, ethers.parseUnits("2500", 18));  // 2500 USDC

        // Approve Swap contract to spend TokenA
        await tokenA.approve(swap.target, ethers.parseUnits("100", 18));
    });

    it("Should swap TokenA (ETH) for TokenB (USDC) correctly", async function () {
        const amountIn = ethers.parseUnits("10", 18); // Swap 10 ETH

        // Get initial balances
        const userETH_Before = await tokenA.balanceOf(owner.address);
        const userUSDC_Before = await tokenB.balanceOf(owner.address);
        const contractETH_Before = await tokenA.balanceOf(swap.target);
        const contractUSDC_Before = await tokenB.balanceOf(swap.target);

        console.log("BEFORE SWAP:");
        console.log(`User ETH: ${ethers.formatUnits(userETH_Before, 18)}`);
        console.log(`User USDC: ${ethers.formatUnits(userUSDC_Before, 18)}`);
        console.log(`Contract ETH: ${ethers.formatUnits(contractETH_Before, 18)}`);
        console.log(`Contract USDC: ${ethers.formatUnits(contractUSDC_Before, 18)}`);

        // Perform the swap
        await swap.swapTokenAToTokenB(amountIn);

        // Get new balances
        const userETH_After = await tokenA.balanceOf(owner.address);
        const userUSDC_After = await tokenB.balanceOf(owner.address);
        const contractETH_After = await tokenA.balanceOf(swap.target);
        const contractUSDC_After = await tokenB.balanceOf(swap.target);

        console.log("\nAFTER SWAP:");
        console.log(`User ETH: ${ethers.formatUnits(userETH_After, 18)}`);
        console.log(`User USDC: ${ethers.formatUnits(userUSDC_After, 18)}`);
        console.log(`Contract ETH: ${ethers.formatUnits(contractETH_After, 18)}`);
        console.log(`Contract USDC: ${ethers.formatUnits(contractUSDC_After, 18)}`);

        // Expect changes
        expect(userETH_After).to.be.below(userETH_Before); // User loses ETH
        expect(userUSDC_After).to.be.above(userUSDC_Before); // User gains USDC
        expect(contractETH_After).to.be.above(contractETH_Before); // Contract gets more ETH
        expect(contractUSDC_After).to.be.below(contractUSDC_Before); // Contract loses USDC
    });
});
