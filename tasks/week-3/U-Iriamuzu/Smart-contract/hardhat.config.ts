import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require('dotenv').config()

const { 
  ALCHEMY_SEPOLIA_API_KEY_URL, 
  ACCOUNT_PRIVATE_KEY, 
  ETHERSCAN_API_KEY,

  ALCHEMY_POLYGON_API_KEY_URL ,
  ACCOUNT_PRIVATE_AMOY_KEY,
  ALCHEMY_LISK_API_KEY_URL,
  ACCOUNT_PRIVATE_LISK_KEY,
  ALCHEMY_METER_API_KEY_URL,
  ACCOUNT_PRIVATE_METER_KEY
} = process.env

const config: HardhatUserConfig = {
  solidity: "0.8.20",

  networks: {
    sepolia: {
      url: ALCHEMY_SEPOLIA_API_KEY_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`]
    },

    polygon_Amoy: {
      url: ALCHEMY_POLYGON_API_KEY_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_AMOY_KEY}`]
    },

    lisk: {
      url: ALCHEMY_LISK_API_KEY_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_LISK_KEY}`]
    },

    meter: {
      url: ALCHEMY_METER_API_KEY_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_METER_KEY}`]
    },
  },

  etherscan: {
    apiKey: ETHERSCAN_API_KEY
  }
};

export default config;
