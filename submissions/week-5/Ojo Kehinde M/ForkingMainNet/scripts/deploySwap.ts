const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contract with address:", deployer.address);

  const router = "0xYourUniswapV2RouterAddress";
  const factory = "0xYourUniswapV2FactoryAddress";

  const UniswapIntegration = await hre.ethers.getContractFactory("UniswapIntegration");
  const uniswap = await UniswapIntegration.deploy(router, factory);

  await uniswap.deployed();

  console.log("UniswapIntegration deployed at:", uniswap.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
