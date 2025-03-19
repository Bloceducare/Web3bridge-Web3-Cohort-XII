import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require('dotenv').config()

const { ALCHEMY_SEPOLIA_API_KEY_URL, LISK_SEPOLIA_RPC_URL, AMOY_RPC_URL, METER_RPC_URL,  ACCOUNT_PRIVATE_KEY, ETHERSCAN_API_KEY } = process.env

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: ALCHEMY_SEPOLIA_API_KEY_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`]
    },
    amoy: { 
      url: AMOY_RPC_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`]
    },
    lisk_sepolia: {
      url: LISK_SEPOLIA_RPC_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`]
    },
    meter: {
      url: METER_RPC_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`]
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
};

export default config;