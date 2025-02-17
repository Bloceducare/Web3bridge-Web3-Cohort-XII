import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy MockERC20
  console.log("Deploying MockERC20...");
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const mockERC20 = await MockERC20.deploy();
  await mockERC20.waitForDeployment();
  const mockTokenAddress = await mockERC20.getAddress();
  console.log("MockERC20 deployed to:", mockTokenAddress);

  // Deploy Staking contract with MockERC20 address
  console.log("Deploying Staking contract...");
  const Staking = await ethers.getContractFactory("Staking");
  const staking = await Staking.deploy(mockTokenAddress);
  await staking.waitForDeployment();
  console.log("Staking deployed to:", await staking.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
