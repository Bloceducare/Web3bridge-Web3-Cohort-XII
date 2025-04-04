import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying Staking with account:", deployer.address);

  const mockTokenAddress = "0xMockTokenAddress"; // Replace with deployed MockERC20 address
  const Staking = await ethers.getContractFactory("Staking");
  const staking = await Staking.deploy(mockTokenAddress);
  await staking.waitForDeployment();

  console.log("Staking deployed to:", await staking.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});