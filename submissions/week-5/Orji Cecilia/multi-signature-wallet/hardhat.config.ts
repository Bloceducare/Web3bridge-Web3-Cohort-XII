import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import "@typechain/hardhat";
import "dotenv/config"; 
import { ethers } from "ethers";

const { 
  ALCHEMY_BASE_SEPOLIA_API_KEY_URL,
  ACCOUNT_PRIVATE_KEY, 
  BASESCAN_API_KEY 
} = process.env;

if (!ALCHEMY_BASE_SEPOLIA_API_KEY_URL || !ACCOUNT_PRIVATE_KEY || !BASESCAN_API_KEY) {
  throw new Error("❌ Missing environment variables. Check your .env file.");
}

//generate test accounts
const generateTestAccounts = (count: number) =>
  Array.from({ length: count }, () => ({
    privateKey: ethers.Wallet.createRandom().privateKey,
    balance: "1000000000000000000000", 
  }));

const config: HardhatUserConfig = {
  solidity: "0.8.28",

  networks: {
    hardhat: {
      accounts: generateTestAccounts(25),
    },
    base_sepolia: {
      url: ALCHEMY_BASE_SEPOLIA_API_KEY_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`],
      timeout: 120000, 
    },
  },

  etherscan: {
    apiKey: BASESCAN_API_KEY,
  },
};

export default config;
