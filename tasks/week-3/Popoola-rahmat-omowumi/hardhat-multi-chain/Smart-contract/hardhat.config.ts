import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config();

const {ALCHEMY_SEPOLIA_API_KEY_URL,ACCOUNT_PRIVATE_KEY,ALCHEMY_LISK_SEPOLIA_API_KEY_URL, ALCHEMY_AMOY_API_KEY_URL, ALCHEMY_METER_KEY_URL,ETHERSCAN_API_KEY}= process.env

const config: HardhatUserConfig = {
  solidity: "0.8.28",
networks: {
  
  sepolia: {
    url: ALCHEMY_SEPOLIA_API_KEY_URL,
    accounts: [`0x${ACCOUNT_PRIVATE_KEY}`]
  },

  amoy: {
    url: ALCHEMY_AMOY_API_KEY_URL,
    accounts: [`0x${ACCOUNT_PRIVATE_KEY}`]
  },
  lisk_sepolia: {
    url: ALCHEMY_LISK_SEPOLIA_API_KEY_URL,
    accounts: [`0x${ACCOUNT_PRIVATE_KEY}`]
  },
  meter: {
    url: ALCHEMY_METER_KEY_URL,
    accounts: [`0x${ACCOUNT_PRIVATE_KEY}`]
  },
},
etherscan: {
  apiKey: ETHERSCAN_API_KEY,
},
}


export default config;
