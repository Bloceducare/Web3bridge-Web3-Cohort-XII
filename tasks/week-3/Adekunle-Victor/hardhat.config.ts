import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require('dotenv').config()
const {ALCHEMY_SEPOLIA_API_KEY_URL, ACCOUNT_PRIVATE_KEY, AMOY_SEPOLIA_KEY, LISK_SEPOLIA_KEY, METER_KEY, ETHERSCAN_API_KEY } = process.env;


const config: HardhatUserConfig = {
  solidity: "0.8.28",

  networks: {
    sepolia: {
      url: ALCHEMY_SEPOLIA_API_KEY_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`],
    },

    amoy: {
      url: AMOY_SEPOLIA_KEY,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`]
    },
    lisk: {
      url: LISK_SEPOLIA_KEY,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`]
    },
    meter: {
      url: METER_KEY,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`]
    }
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
       
  }   
};

export default config;
