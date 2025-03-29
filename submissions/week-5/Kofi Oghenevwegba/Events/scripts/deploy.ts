import { ethers, network } from "hardhat";
import hre from "hardhat";

async function verifyContract(address: string, constructorArguments: any[] = []) {
  if (network.name === "hardhat" || network.name === "localhost") return;

  console.log("Waiting for block confirmations...");
  await new Promise(resolve => setTimeout(resolve, 30000)); // Wait for Base Sepolia confirmations

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
    
    // Deploy Based (ERC20 token)
    console.log("\nDeploying Based Token...");
    const Based = await ethers.getContractFactory("Based");
    const based = await Based.deploy(await (await ethers.getSigners())[0].getAddress());
    await based.waitForDeployment();
    const basedAddress = await based.getAddress();
    console.log(`Based Token deployed to: ${basedAddress}`);

    // Deploy OnChainNft
    console.log("\nDeploying OnChainNft...");
    const OnChainNft = await ethers.getContractFactory('OnChainNFT');
    const onChainNft = await OnChainNft.deploy(
      await (await ethers.getSigners())[0].getAddress(), 
      "Event Ticket", 
      "TKT"
    );
    await onChainNft.waitForDeployment();
    const nftAddress = await onChainNft.getAddress();
    console.log(`OnChainNft deployed to: ${nftAddress}`);

    // Deploy EventFactory
    console.log("\nDeploying EventFactory...");
    const EventFactory = await ethers.getContractFactory("EventFactory");
    const eventFactory = await EventFactory.deploy();
    await eventFactory.waitForDeployment();
    const factoryAddress = await eventFactory.getAddress();
    console.log(`EventFactory deployed to: ${factoryAddress}`);

    // Log all deployed addresses
    console.log("\nDeployment Summary:");
    console.log("-------------------");
    console.log(`Network: ${network.name}`);
    console.log(`Based: ${basedAddress}`);
    console.log(`OnChainNft: ${nftAddress}`);
    console.log(`EventFactory: ${factoryAddress}`);

    // Save deployment addresses
    const fs = require("fs");
    const deployments = {
      network: network.name,
      based: basedAddress,
      onChainNft: nftAddress, 
      eventFactory: factoryAddress,
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
      
      await verifyContract(nftAddress, [
        await (await ethers.getSigners())[0].getAddress(), 
        "Event Ticket", 
        "TKT"
      ]);
      
      await verifyContract(factoryAddress, []);
    }

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
