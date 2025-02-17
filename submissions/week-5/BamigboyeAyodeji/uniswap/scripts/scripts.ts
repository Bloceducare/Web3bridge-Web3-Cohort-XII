import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log(`Deploying contracts with account: ${deployer.address}`);

  // Deploy Token A
  const TokenA = await ethers.getContractFactory("ERC20");
  const tokenA = await TokenA.deploy("Token A", "TKA", 1000000);
  await tokenA.waitForDeployment();
  console.log(`Token A deployed at: ${await tokenA.getAddress()}`);

  // Deploy Token B
  const TokenB = await ethers.getContractFactory("ERC20");
  const tokenB = await TokenB.deploy("Token B", "TKB", 1000000);
  await tokenB.waitForDeployment();
  console.log(`Token B deployed at: ${await tokenB.getAddress()}`);

  // Deploy UniswapLike
  const UniswapLike = await ethers.getContractFactory("UniswapLike");
  const uniswap = await UniswapLike.deploy(
    await tokenA.getAddress(),
    await tokenB.getAddress()
  );
  await uniswap.waitForDeployment();
  console.log(`UniswapLike deployed at: ${await uniswap.getAddress()}`);

  // Fund some accounts with tokens
  const [owner, addr1] = await ethers.getSigners();
  await tokenA.transfer(addr1.address, 10000);
  await tokenB.transfer(addr1.address, 10000);
  console.log(`Funded ${addr1.address} with 10,000 TKA & 10,000 TKB`);
}

// Run the script
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
