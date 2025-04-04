import { ethers, network } from "hardhat";
import hre from "hardhat";

async function verifyContract(address: string, constructorArguments: any[] = []) {
  if (network.name === "hardhat" || network.name === "localhost") return;

  console.log("Waiting for block confirmations...");
  await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds

  try {
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: constructorArguments,
    });
    console.log(`Contract verified at ${address}`);
  } catch (error: any) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log("Contract already verified!");
    } else {
      console.error("Error verifying contract:", error);
    }
  }
}

async function main() {
  try {
    console.log("Starting deployment process...");
    
    // Deploy TestStakingToken
    console.log("\nDeploying TestStakingToken...");
    const TestStakingToken = await ethers.getContractFactory("TestStakingToken");
    const stakingToken = await TestStakingToken.deploy();
    await stakingToken.waitForDeployment();
    const stakingTokenAddress = await stakingToken.getAddress();
    console.log(`TestStakingToken deployed to: ${stakingTokenAddress}`);

    // Deploy TestRewardToken
    console.log("\nDeploying TestRewardToken...");
    const TestRewardToken = await ethers.getContractFactory("TestRewardToken");
    const rewardToken = await TestRewardToken.deploy();
    await rewardToken.waitForDeployment();
    const rewardTokenAddress = await rewardToken.getAddress();
    console.log(`TestRewardToken deployed to: ${rewardTokenAddress}`);

    // Deploy Staking Contract
    console.log("\nDeploying Staking Contract...");
    const Staking = await ethers.getContractFactory("Staking");
    const staking = await Staking.deploy(stakingTokenAddress, rewardTokenAddress);
    await staking.waitForDeployment();
    const stakingAddress = await staking.getAddress();
    console.log(`Staking Contract deployed to: ${stakingAddress}`);

    // Fund the staking contract with reward tokens
    console.log("\nFunding Staking Contract with reward tokens...");
    const fundAmount = ethers.parseEther("100000"); // 100,000 tokens
    await rewardToken.transfer(stakingAddress, fundAmount);
    console.log(`Transferred ${ethers.formatEther(fundAmount)} reward tokens to staking contract`);

    // Log all deployed addresses
    console.log("\nDeployment Summary:");
    console.log("-------------------");
    console.log(`Network: ${network.name}`);
    console.log(`TestStakingToken: ${stakingTokenAddress}`);
    console.log(`TestRewardToken: ${rewardTokenAddress}`);
    console.log(`Staking Contract: ${stakingAddress}`);

    // Save deployment addresses
    const fs = require("fs");
    const deployments = {
      network: network.name,
      stakingToken: stakingTokenAddress,
      rewardToken: rewardTokenAddress,
      stakingContract: stakingAddress,
      timestamp: new Date().toISOString()
    };

    const deploymentsDir = "./deployments";
    if (!fs.existsSync(deploymentsDir)){
      fs.mkdirSync(deploymentsDir);
    }

    fs.writeFileSync(
      `${deploymentsDir}/${network.name}.json`,
      JSON.stringify(deployments, null, 2)
    );

    // Start verification process
    if (network.name !== "hardhat" && network.name !== "localhost") {
      console.log("\nStarting contract verification...");
      
      // Verify TestStakingToken
      await verifyContract(stakingTokenAddress, []);
      
      // Verify TestRewardToken
      await verifyContract(rewardTokenAddress, []);
      
      // Verify Staking Contract
      await verifyContract(stakingAddress, [stakingTokenAddress, rewardTokenAddress]);
    }

    // Additional helpful information
    console.log("\nNext steps:");
    console.log("1. Add the following tokens to your wallet:");
    console.log(`   Staking Token: ${stakingTokenAddress}`);
    console.log(`   Reward Token: ${rewardTokenAddress}`);
    console.log("2. To stake tokens:");
    console.log(`   a. First approve the staking contract (${stakingAddress}) to spend your staking tokens`);
    console.log("   b. Then call the stake function with your desired amount");

    console.log("\nDeployment completed successfully!");

  } catch (error) {
    console.error("Deployment failed:", error);
    process.exitCode = 1;
  }
}

// Execute deployment
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});