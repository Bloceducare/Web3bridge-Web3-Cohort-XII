import { ethers, network } from "hardhat";
import hre from "hardhat";
import fs from "fs";

async function verifyContract(address: string, constructorArguments: any[] = []) {
  if (network.name === "hardhat" || network.name === "localhost") return;

  console.log("Waiting for block confirmations...");
  await new Promise(resolve => setTimeout(resolve, 30000));

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

    // Deploy KemsguyAirdrop
    console.log("\nDeploying KemsguyAirdrop...");
    const tokenAddress = "0xcde04203314146d133389e7abb29311df156f683"; // Your ERC20 token
    const airdropAmount = ethers.parseEther("100"); // 100 tokens per address

    const Airdrop = await ethers.getContractFactory("KemsguyAirdrop");
    const airdrop = await Airdrop.deploy(
      tokenAddress,
      airdropAmount
    );
    await airdrop.waitForDeployment();
    const airdropAddress = await airdrop.getAddress();
    console.log(`KemsguyAirdrop deployed to: ${airdropAddress}`);

    // Log deployment summary
    console.log("\nDeployment Summary:");
    console.log("-------------------");
    console.log(`Network: ${network.name}`);
    console.log(`Airdrop Contract: ${airdropAddress}`);
    console.log(`Token Address: ${tokenAddress}`);

    // Save deployment addresses
    const deployments = {
      network: network.name,
      airdrop: airdropAddress,
      token: tokenAddress,
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

    // Verify contract
    if (network.name !== "hardhat" && network.name !== "localhost") {
      console.log("\nStarting contract verification...");
      await verifyContract(airdropAddress, [tokenAddress, airdropAmount]);
    }

    console.log("\nDeployment completed successfully!");

  } catch (error) {
    console.error("Deployment failed:", error);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});