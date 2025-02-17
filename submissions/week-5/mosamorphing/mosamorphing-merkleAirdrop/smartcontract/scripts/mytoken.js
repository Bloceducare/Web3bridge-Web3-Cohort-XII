const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy the ERC20 Token
  const MyToken = await hre.ethers.getContractFactory("MyToken");
  const myToken = await MyToken.deploy(1000000); // 1M tokens

  // Wait for the deployment to complete
  await myToken.deployed(); // Use .deployed() to wait for the contract to be fully deployed

  console.log("MyToken deployed to:", myToken.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});