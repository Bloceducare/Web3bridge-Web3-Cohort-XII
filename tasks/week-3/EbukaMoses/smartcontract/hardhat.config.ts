import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require('dotenv').config()


const {
  ALCHEMY_SEPOLIA_API_KEY_URL,
  ACCOUNT_PRIVATE_KEY,
  AMOY_API_KEY_URL,
  LISK_API_KEY_URL,
  METER_API_KEY_URL,
} = process.env;

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: ALCHEMY_SEPOLIA_API_KEY_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`],
    },
    amoy: {
      url: AMOY_API_KEY_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`],
    },
    lisk: {
      url: LISK_API_KEY_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`],
    },
    meter: {
      url: METER_API_KEY_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`],
    },
  },
};

export default config;
