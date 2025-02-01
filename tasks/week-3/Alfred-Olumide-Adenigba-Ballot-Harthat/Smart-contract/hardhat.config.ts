import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require('dotenv').config()

const { AMOY_RPC_URL, ACCOUNT_PRIVATE_KEY, ACCOUNT_PRIVATE_KEY2, LISK_SEPOLIA_RPC_URL, SEPOLIA_RPC_URL, METER_RPC_URL, ETHERSCAN_API_KEY } = process.env;


const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    amoy: {
      url: AMOY_RPC_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`]
    },
    liskSepolia: {
      url: LISK_SEPOLIA_RPC_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`]
    },
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`]
    },
    meter: {
      url: METER_RPC_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`]
    }
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  }  
};

export default config;