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

async function getBoardMembers() {
  // For test networks, generate addresses from signers
  if (network.name === "hardhat" || network.name === "localhost") {
    const signers = await ethers.getSigners();
    return signers.slice(0, 20).map(signer => signer.address);
  }


  const envBoardMembers = process.env.BOARD_MEMBERS;
  if (envBoardMembers) {
    try {
      const addresses = JSON.parse(envBoardMembers);
      if (Array.isArray(addresses) && addresses.length === 20) {
        return addresses;
      }
    } catch (error) {
      console.error("Error parsing BOARD_MEMBERS environment variable");
    }
  }

 
    // 
  console.warn("Remember to replace  dummy board member addresses before deploying to mainnet");
  const dummyAddresses = Array(20).fill(0).map((_, i) => {
    const wallet = ethers.Wallet.createRandom();
    return wallet.address;
  });
  
  return dummyAddresses;
}

async function main() {
  try {
    // Pre-deployment checks
    if (network.name === "base_sepolia") {
      console.log("\nDeploying to Base Sepolia...");
      console.log(`ChainId: ${network.config.chainId}`);
    }

    const [deployer] = await ethers.getSigners();
    console.log(`Deploying with account: ${deployer.address}`);
    
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log(`Account balance: ${ethers.formatEther(balance)} ETH\n`);

    // Get board member addresses
    const boardMembers = await getBoardMembers();
    console.log("\nBoard Members:");
    boardMembers.forEach((address, i) => {
      console.log(`${i + 1}. ${address}`);
    });

    // Deploy CompanyFundManager
    console.log("\nDeploying CompanyFundManager contract...");
    const FundManagerFactory = await ethers.getContractFactory("CompanyFundManager");
    const fundManager = await FundManagerFactory.deploy(boardMembers);
    await fundManager.waitForDeployment();
    
    const fundManagerAddress = await fundManager.getAddress();
    console.log(`CompanyFundManager deployed to: ${fundManagerAddress}`);

    // Save deployment addresses
    const deployments = {
      network: network.name,
      chainId: network.config.chainId,
      fundManager: fundManagerAddress,
      boardMembers: boardMembers,
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
      await verifyContract(fundManagerAddress, [boardMembers]);
    }

    console.log("\nDeployment completed successfully! 🎉");

  } catch (error) {
    console.error("Deployment failed:", error);
    process.exitCode = 1;
  }
}

// Execute deployment
if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}