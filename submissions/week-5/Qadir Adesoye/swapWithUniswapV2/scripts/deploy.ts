import { ethers } from "hardhat";
import { SimpleSwap, MockERC20 } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

async function main() {
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", await deployer.getAddress());

  // Define initial supply and liquidity amounts
  const initialSupply = ethers.parseEther("1000");
  const initialLiquidity = ethers.parseEther("100");
  const swapAmount = ethers.parseEther("10");

  // Step 1: Deploy MockERC20 tokens
  console.log("\n=== Deploying MockERC20 Tokens ===");
  const Token = await ethers.getContractFactory("MockERC20");
  
  console.log("Deploying Token0 (TK0)...");
  const token0 = await Token.deploy("Token0", "TK0");
  await token0.waitForDeployment();
  const token0Address = await token0.getAddress();
  console.log("Token0 deployed to:", token0Address);
  console.log("Transaction hash:", (await token0.deploymentTransaction())?.hash);
  console.log("Expected result: Token0 deployed with name 'Token0' and symbol 'TK0'");

  console.log("\nDeploying Token1 (TK1)...");
  const token1 = await Token.deploy("Token1", "TK1");
  await token1.waitForDeployment();
  const token1Address = await token1.getAddress();
  console.log("Token1 deployed to:", token1Address);
  console.log("Transaction hash:", (await token1.deploymentTransaction())?.hash);
  console.log("Expected result: Token1 deployed with name 'Token1' and symbol 'TK1'");

  // Step 2: Deploy SimpleSwap contract
  console.log("\n=== Deploying SimpleSwap Contract ===");
  const SimpleSwap = await ethers.getContractFactory("SimpleSwap");
  console.log("Deploying SimpleSwap with Token0 and Token1...");
  const simpleSwap = await SimpleSwap.deploy(token0Address, token1Address);
  await simpleSwap.waitForDeployment();
  const simpleSwapAddress = await simpleSwap.getAddress();
  console.log("SimpleSwap deployed to:", simpleSwapAddress);
  console.log("Transaction hash:", (await simpleSwap.deploymentTransaction())?.hash);
  console.log("Expected result: SimpleSwap deployed with Token0 and Token1 addresses set");

  // Step 3: Mint tokens to deployer
  console.log("\n=== Minting Tokens ===");
  console.log("Minting", ethers.formatEther(initialSupply), "Token0 to deployer...");
  const mintTx0 = await token0.connect(deployer).mint(await deployer.getAddress(), initialSupply);
  await mintTx0.wait();
  console.log("Transaction hash:", mintTx0.hash);
  console.log("Expected result: Deployer balance increased by", ethers.formatEther(initialSupply), "Token0");

  console.log("Minting", ethers.formatEther(initialSupply), "Token1 to deployer...");
  const mintTx1 = await token1.connect(deployer).mint(await deployer.getAddress(), initialSupply);
  await mintTx1.wait();
  console.log("Transaction hash:", mintTx1.hash);
  console.log("Expected result: Deployer balance increased by", ethers.formatEther(initialSupply), "Token1");

  // Step 4: Approve SimpleSwap to spend tokens
  console.log("\n=== Approving Token Spending ===");
  console.log("Approving SimpleSwap to spend Token0...");
  const approveTx0 = await token0.connect(deployer).approve(simpleSwapAddress, ethers.MaxUint256);
  await approveTx0.wait();
  console.log("Transaction hash:", approveTx0.hash);
  console.log("Expected result: SimpleSwap approved to spend max Token0");

  console.log("Approving SimpleSwap to spend Token1...");
  const approveTx1 = await token1.connect(deployer).approve(simpleSwapAddress, ethers.MaxUint256);
  await approveTx1.wait();
  console.log("Transaction hash:", approveTx1.hash);
  console.log("Expected result: SimpleSwap approved to spend max Token1");

  // Step 5: Add initial liquidity
  console.log("\n=== Adding Initial Liquidity ===");
  console.log("Adding", ethers.formatEther(initialLiquidity), "Token0 and Token1 to liquidity pool...");
  const liquidityTx = await simpleSwap.connect(deployer).addLiquidity(initialLiquidity, initialLiquidity);
  await liquidityTx.wait();
  console.log("Transaction hash:", liquidityTx.hash);
  console.log("Expected result: Liquidity added, reserves updated to", ethers.formatEther(initialLiquidity), "each");

  // Verify reserves after adding liquidity
  const [reserve0, reserve1] = await simpleSwap.getReserves();
  console.log("Current reserves after liquidity addition:");
  console.log("Token0 reserve:", ethers.formatEther(reserve0));
  console.log("Token1 reserve:", ethers.formatEther(reserve1));

  // Step 6: Perform swaps
  console.log("\n=== Performing Swaps ===");
  
  // Swap Token0 for Token1
  console.log("Swapping", ethers.formatEther(swapAmount), "Token0 for Token1...");
  const amountOut0For1 = await simpleSwap.getAmountOut(swapAmount, reserve0, reserve1);
  console.log("Expected Token1 output:", ethers.formatEther(amountOut0For1));
  const swapTx0For1 = await simpleSwap.connect(deployer).swap0For1(
    swapAmount,
    amountOut0For1,
    await deployer.getAddress()
  );
  await swapTx0For1.wait();
  console.log("Transaction hash:", swapTx0For1.hash);
  console.log("Expected result: Token0 reserves increased, Token1 reserves decreased");

  // Verify reserves after swap0For1
  const [newReserve0, newReserve1] = await simpleSwap.getReserves();
  console.log("Current reserves after swap0For1:");
  console.log("Token0 reserve:", ethers.formatEther(newReserve0));
  console.log("Token1 reserve:", ethers.formatEther(newReserve1));

  // Swap Token1 for Token0
  console.log("\nSwapping", ethers.formatEther(swapAmount), "Token1 for Token0...");
  const amountOut1For0 = await simpleSwap.getAmountOut(swapAmount, newReserve1, newReserve0);
  console.log("Expected Token0 output:", ethers.formatEther(amountOut1For0));
  const swapTx1For0 = await simpleSwap.connect(deployer).swap1For0(
    swapAmount,
    amountOut1For0,
    await deployer.getAddress()
  );
  await swapTx1For0.wait();
  console.log("Transaction hash:", swapTx1For0.hash);
  console.log("Expected result: Token1 reserves increased, Token0 reserves decreased");

  // Verify reserves after swap1For0
  const [finalReserve0, finalReserve1] = await simpleSwap.getReserves();
  console.log("Current reserves after swap1For0:");
  console.log("Token0 reserve:", ethers.formatEther(finalReserve0));
  console.log("Token1 reserve:", ethers.formatEther(finalReserve1));

  console.log("\n=== Deployment and Interaction Completed Successfully ===");
}

main().catch((error) => {
  console.error("Error:", error);
  process.exitCode = 1;
});