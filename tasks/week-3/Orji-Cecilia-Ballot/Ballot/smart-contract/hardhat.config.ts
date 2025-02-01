import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
require("dotenv").config();

const { 
  ALCHEMY_SEPOLIA_API_KEY_URL, 
  ALCHEMY_POLYGON_AMOY_API_KEY_URL,
  ALCHEMY_LISK_SEPOLIA_API_KEY_URL, 
  ALCHEMY_METER_TESTNET_API_KEY_URL, 
  ACCOUNT_PRIVATE_KEY, 
  ETHERSCAN_API_KEY 
} = process.env;

const config: HardhatUserConfig = {
  solidity: "0.8.28",

  networks: {
    sepolia: {
      url: ALCHEMY_SEPOLIA_API_KEY_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`],
    },
    liskSepolia: {
      url: ALCHEMY_LISK_SEPOLIA_API_KEY_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`],
    },
    meterTestnet: {
      url: ALCHEMY_METER_TESTNET_API_KEY_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`],
    },
    polygon: {
      url: ALCHEMY_POLYGON_AMOY_API_KEY_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`],
    },
  },

  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },

  sourcify: {
    enabled: true,
  },
};

export default config;
