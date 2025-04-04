import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying MockERC20 with account:", deployer.address);

  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const mockERC20 = await MockERC20.deploy();
  await mockERC20.waitForDeployment();

  console.log("MockERC20 deployed to:", await mockERC20.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});