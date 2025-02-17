import * as dotenv from "dotenv";
dotenv.config();

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const { 
  ALCHEMY_SEPOLIA_API_KEY_URL, 
  ALCHEMY_LISK_SEPOLIA_API_KEY_URL, 
  ALCHEMY_AMOY_API_KEY_URL, 
  ALCHEMY_METER_KEY_URL,  
  ACCOUNT_PRIVATE_KEY, 
  ETHERSCAN_API_KEY 
} = process.env;

// Ensure all required environment variables are defined
if (!ALCHEMY_SEPOLIA_API_KEY_URL || !ALCHEMY_AMOY_API_KEY_URL || !ALCHEMY_LISK_SEPOLIA_API_KEY_URL || !ALCHEMY_METER_KEY_URL || !ACCOUNT_PRIVATE_KEY || !ETHERSCAN_API_KEY) {
  throw new Error("Missing environment variables! Check your .env file.");
}

const config: HardhatUserConfig = {
  defaultNetwork: "sepolia",
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: ALCHEMY_SEPOLIA_API_KEY_URL,
      accounts: ACCOUNT_PRIVATE_KEY.startsWith("0x") ? [ACCOUNT_PRIVATE_KEY] : [`0x${ACCOUNT_PRIVATE_KEY}`],
    },
    amoy: {
      url: ALCHEMY_AMOY_API_KEY_URL,
      accounts: ACCOUNT_PRIVATE_KEY.startsWith("0x") ? [ACCOUNT_PRIVATE_KEY] : [`0x${ACCOUNT_PRIVATE_KEY}`],
    },
    lisk_sepolia: {
      url: ALCHEMY_LISK_SEPOLIA_API_KEY_URL,
      accounts: ACCOUNT_PRIVATE_KEY.startsWith("0x") ? [ACCOUNT_PRIVATE_KEY] : [`0x${ACCOUNT_PRIVATE_KEY}`],
    },
    meter: {
      url: ALCHEMY_METER_KEY_URL,
      accounts: ACCOUNT_PRIVATE_KEY.startsWith("0x") ? [ACCOUNT_PRIVATE_KEY] : [`0x${ACCOUNT_PRIVATE_KEY}`],
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
};

export default config;
