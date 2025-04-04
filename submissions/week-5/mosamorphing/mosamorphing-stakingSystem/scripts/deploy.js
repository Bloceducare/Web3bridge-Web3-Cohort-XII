const { ethers } = require("hardhat");

async function main() {
  // Get the contract factory for ERC20Mock
  const ERC20Mock = await ethers.getContractFactory("ERC20Mock");

  // Deploy the ERC20Mock contract
  const erc20Mock = await ERC20Mock.deploy("Staking Token", "STK", 18);
  await erc20Mock.deployTransaction.wait(); // Wait for the contract to be deployed

  console.log("ERC20Mock deployed to:", erc20Mock.address);

  // Get the contract factory for StakingSystem
  const StakingSystem = await ethers.getContractFactory("StakingSystem");

  // Deploy the StakingSystem contract, passing the ERC20Mock address
  const stakingSystem = await StakingSystem.deploy(erc20Mock.address);
  await stakingSystem.deployTransaction.wait(); // Wait for the contract to be deployed

  console.log("StakingSystem deployed to:", stakingSystem.address);
}

// Run the deployment script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });