import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require('dotenv').config()

const {INFURA_METER_API_KEY_URL, INFURA_LISK_SEPOLIA_API_KEY_URL, INFURA_AMOY_API_KEY_URL, INFURA_SEPOLIA_API_KEY_URL, ACCOUNT_PRIVATE_KEY} = process.env

const config: HardhatUserConfig = {
  solidity: "0.8.28",

  networks: {
    sepolia: {
      url: INFURA_SEPOLIA_API_KEY_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`]
    },
    amoy: {
      url: INFURA_AMOY_API_KEY_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`]
    },
    liskSepolia: {
      url: INFURA_LISK_SEPOLIA_API_KEY_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`]
    },
    Meter: {
      url: INFURA_METER_API_KEY_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`]
    }
  }
};

export default config;
