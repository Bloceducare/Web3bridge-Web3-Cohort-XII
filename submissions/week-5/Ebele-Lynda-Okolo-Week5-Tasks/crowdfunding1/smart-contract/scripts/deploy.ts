import { ethers } from "hardhat";
import { TestToken, Crowdfunding } from "../typechain-types";

async function main() {
  // Deploy TestToken first
  const TestTokenFactory = await ethers.getContractFactory("TestToken");
  const testToken = await TestTokenFactory.deploy() as TestToken;
  await testToken.waitForDeployment();
  const tokenAddress = await testToken.getAddress();
  console.log(`TestToken deployed to: ${tokenAddress}`);

  // Deploy Crowdfunding with TestToken address
  const CrowdfundingFactory = await ethers.getContractFactory("Crowdfunding");
  const crowdfunding = await CrowdfundingFactory.deploy(tokenAddress) as Crowdfunding;
  await crowdfunding.waitForDeployment();
  const crowdfundingAddress = await crowdfunding.getAddress();
  console.log(`Crowdfunding deployed to: ${crowdfundingAddress}`);

  // For verification
  console.log("\nVerification data:");
  console.log("TestToken Contract:", tokenAddress);
  console.log("Crowdfunding Contract:", crowdfundingAddress);
  console.log("Crowdfunding Constructor Args:", [tokenAddress]);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });