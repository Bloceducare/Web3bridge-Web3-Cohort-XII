import hre, { ethers } from "hardhat";
import { OptimizedCompanyFundManager } from "../typechain-types";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const treasuryAddress = process.env.TREASURY_ADDRESS;
  if (!treasuryAddress) {
    throw new Error("Treasury address not found in environment variables");
  }

  console.log("🚀 Deploying OptimizedCompanyFundManager...");
  console.log("🏦 Treasury Address:", treasuryAddress);

  // Deploy contract
  const CompanyFund = await ethers.getContractFactory(
    "OptimizedCompanyFundManager"
  );
  const companyFund = await CompanyFund.deploy(treasuryAddress);
  await companyFund.waitForDeployment(); // Ensure deployment completes

  const address = await companyFund.getAddress();
  console.log("✅ OptimizedCompanyFundManager deployed to:", address);

  // Get Etherscan base URL based on the network
  const network = hre.network.name;
  const etherscanBaseURL = getEtherscanURL("base-sepolia");

  // Wait for a few block confirmations before verifying
  if (process.env.ETHERSCAN_API) {
    console.log("⏳ Waiting for 6 block confirmations before verification...");
    const deployTx = companyFund.deploymentTransaction();
    if (deployTx) {
      await deployTx.wait(6); // Ensures Etherscan indexes the contract
      await verifyContract(address, treasuryAddress, etherscanBaseURL);
    }
  }

  console.log("\n📜 Deployment Details:");
  console.log("----------------------");
  console.log("✅ Contract Address:", address);
  console.log("🏦 Treasury Address:", treasuryAddress);
  console.log("🌐 Network:", network);
  console.log("📌 Block Number:", await ethers.provider.getBlockNumber());
  console.log(
    "🔗 View on Etherscan:",
    `${etherscanBaseURL}/address/${address}`
  );
}

// Contract verification function
async function verifyContract(
  address: string,
  treasuryAddress: string,
  etherscanBaseURL: string
) {
  try {
    console.log(`🔍 Verifying contract at ${address}...`);
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: [treasuryAddress],
    });
    console.log("✅ Contract verified successfully!");
    console.log(
      `🔗 View verified contract: ${etherscanBaseURL}/address/${address}#code`
    );
  } catch (error: any) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log("✅ Contract is already verified!");
      console.log(
        `🔗 View verified contract: ${etherscanBaseURL}/address/${address}#code`
      );
    } else {
      console.error("❌ Error verifying contract:", error);
    }
  }
}

function getEtherscanURL(network: string): string {
  const explorers: { [key: string]: string } = {
    mainnet: "https://etherscan.io",
    sepolia: "https://sepolia.etherscan.io",
    goerli: "https://goerli.etherscan.io",
    polygon: "https://polygonscan.com",
    "polygon-mumbai": "https://mumbai.polygonscan.com",
    optimism: "https://optimistic.etherscan.io",
    "optimism-goerli": "https://goerli-optimism.etherscan.io",
    base: "https://basescan.org",
    "base-sepolia": "https://sepolia.basescan.org", // ✅ Added Base Sepolia
    arbitrum: "https://arbiscan.io",
    "arbitrum-goerli": "https://goerli.arbiscan.io",
    "zkSync-sepolia": "https://sepolia.explorer.zksync.io",
    "zkSync-era": "https://explorer.zksync.io",
  };
  return explorers[network] || `https://${network}.etherscan.io`;
}

// Execute deployment script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
