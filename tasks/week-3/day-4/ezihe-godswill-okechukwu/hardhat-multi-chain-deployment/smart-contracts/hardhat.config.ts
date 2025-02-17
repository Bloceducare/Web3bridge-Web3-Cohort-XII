import dotenv from "dotenv";
import "@nomicfoundation/hardhat-toolbox";
import { HardhatUserConfig } from "hardhat/config";

dotenv.config();

const {
  AMOY_URL,
  METER_URL,
  SEPOLIA_URL,
  LISK_SEPOLIA_URL,
  ETHERSCAN_API_KEY,
  ACCOUNT_PRIVATE_KEY,
} = process.env;

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: SEPOLIA_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`],
    },
    amoy: {
      url: AMOY_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`],
    },
    lisk_sepolia: {
      url: LISK_SEPOLIA_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`],
    },
    meter: {
      url: METER_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`],
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
};

export default config;
