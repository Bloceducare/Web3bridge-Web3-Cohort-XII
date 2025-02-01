import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config();

const { ALCHEMY_SEPOLIA_API_KEY_URL, ACCOUNT_PRIVATE_KEY, ETHERSCAN_API_KEY } = process.env;

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    hardhat: {},
    sepolia: {
      url: ALCHEMY_SEPOLIA_API_KEY_URL,
      accounts: ACCOUNT_PRIVATE_KEY ? [`0x${ACCOUNT_PRIVATE_KEY}`] : [],
    },
    Lisksepolila: {
      url: process.env.ALCHEMY_LISK_SEPOLIA_API_KEY_URL,
      accounts: ACCOUNT_PRIVATE_KEY ? [`0x${ACCOUNT_PRIVATE_KEY}`] : [],
    },
    amoy: {
      url: process.env.ALCHEMY_AMOY_KEY_URL,
      accounts: ACCOUNT_PRIVATE_KEY ? [`0x${ACCOUNT_PRIVATE_KEY}`] : [],
    },
    meter: {
      url: process.env.ALCHEMY_METER_KEY_URL,
      accounts: ACCOUNT_PRIVATE_KEY ? [`0x${ACCOUNT_PRIVATE_KEY}`] : [],
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY, 
  },
};

export default config;
