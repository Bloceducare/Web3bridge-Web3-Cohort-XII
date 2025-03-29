import { ethers } from "hardhat";

async function main() {
  console.log("✅ Starting Swap contract deployment and interaction script...");

  // Get signers
  const [deployer, user1] = await ethers.getSigners();
  console.log(`Deployer: ${deployer.address}`);
  console.log(`User1: ${user1.address}`);

  // Deploy TokenX
  console.log("\n📝 Deploying TokenX...");
  const TokenXFactory = await ethers.getContractFactory("Token");
  const tokenX = await TokenXFactory.deploy("TokenX", "TKX");
  await tokenX.waitForDeployment();
  console.log(`✅🎉 TokenX deployed at: ${tokenX.target}`);

  // Deploy TokenY
  console.log("\n✔ Deploying TokenY...");
  const TokenYFactory = await ethers.getContractFactory("Token");
  const tokenY = await TokenYFactory.deploy("TokenY", "TKY");
  await tokenY.waitForDeployment();
  console.log(`✔ TokenY deployed at: ${tokenY.target}`);

  // Deploy Swap contract
  console.log("\n📝 Deploying Swap contract...");
  const SwapFactory = await ethers.getContractFactory("Swap");
  const swap = await SwapFactory.deploy(tokenX.target, tokenY.target);
  await swap.waitForDeployment();
  console.log(`Swap contract deployed at: ${swap.target}`);

  // Mint tokens to deployer for adding liquidity
  console.log("\n🚀 Minting tokens to deployer for liquidity...");
  const liquidityAmountX = ethers.parseUnits("1000", 18);
  const liquidityAmountY = ethers.parseUnits("2000", 18);
  
  await tokenX.mint(deployer.address, liquidityAmountX);
  await tokenY.mint(deployer.address, liquidityAmountY);
  console.log(`✅ Minted ${ethers.formatUnits(liquidityAmountX, 18)} TokenX to deployer`);
  console.log(`✅ Minted ${ethers.formatUnits(liquidityAmountY, 18)} TokenY to deployer`);

  // Approve and add liquidity
  console.log("\nAdding liquidity to the pool...");
  await tokenX.approve(swap.target, liquidityAmountX);
  await tokenY.approve(swap.target, liquidityAmountY);
  await swap.addLiquidity(liquidityAmountX, liquidityAmountY);
  console.log("✅🎉 Liquidity added successfully");

  // Print pool reserves
  const reserveX = await swap.reserveX();
  const reserveY = await swap.reserveY();
  console.log(`Pool reserves: ${ethers.formatUnits(reserveX, 18)} TokenX, ${ethers.formatUnits(reserveY, 18)} TokenY`);

  // Mint tokens to user1 for swapping
  console.log("\n🚀 Minting tokens to user1 for swapping...");
  const swapAmountX = ethers.parseUnits("50", 18);
  const swapAmountY = ethers.parseUnits("100", 18);
  
  await tokenX.mint(user1.address, swapAmountX);
  await tokenY.mint(user1.address, swapAmountY);
  console.log(`✅ Minted ${ethers.formatUnits(swapAmountX, 18)} TokenX to user1`);
  console.log(`✅🎉 Minted ${ethers.formatUnits(swapAmountY, 18)} TokenY to user1`);

  // User1 swaps TokenX for TokenY
  console.log("\n📝 User1 swapping TokenX for TokenY...");
  const user1TokenX = tokenX.connect(user1);
  const user1Swap = swap.connect(user1);
  
  // Calculate expected output
  const amountXWithFee = (swapAmountX * BigInt(997)) / BigInt(1000); // 0.3% fee
  const expectedAmountOut = (reserveY * amountXWithFee) / (reserveX + amountXWithFee);
  console.log(`Expected output: ~${ethers.formatUnits(expectedAmountOut, 18)} TokenY`);

  // Check balances before swap
  const user1BalanceXBefore = await tokenX.balanceOf(user1.address);
  const user1BalanceYBefore = await tokenY.balanceOf(user1.address);
  console.log(`User1 balance before swap: ${ethers.formatUnits(user1BalanceXBefore, 18)} TokenX, ${ethers.formatUnits(user1BalanceYBefore, 18)} TokenY`);

  // Approve and swap
  await user1TokenX.approve(swap.target, swapAmountX);
  await user1Swap.swapXforY(swapAmountX);
  
  // Check balances after swap
  const user1BalanceXAfter = await tokenX.balanceOf(user1.address);
  const user1BalanceYAfter = await tokenY.balanceOf(user1.address);
  console.log(`User1 balance after swap: ${ethers.formatUnits(user1BalanceXAfter, 18)} TokenX, ${ethers.formatUnits(user1BalanceYAfter, 18)} TokenY`);
  console.log(`✅🎉 Tokens swapped: -${ethers.formatUnits(user1BalanceXBefore - user1BalanceXAfter, 18)} TokenX, +${ethers.formatUnits(user1BalanceYAfter - user1BalanceYBefore, 18)} TokenY`);

  // Updated pool reserves
  const newReserveX = await swap.reserveX();
  const newReserveY = await swap.reserveY();
  console.log(`\n🚀 Updated pool reserves: ${ethers.formatUnits(newReserveX, 18)} TokenX, ${ethers.formatUnits(newReserveY, 18)} TokenY`);

  console.log("\n🚀✅🎉 Script execution completed.");
}

// Execute the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });