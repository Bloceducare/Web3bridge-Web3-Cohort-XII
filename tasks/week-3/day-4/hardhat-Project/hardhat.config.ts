import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config();

const {LISK_API_KEY_URL, ALCHEMY_AMOY_API_KEY_URL, ALCHEMY_SEPOLIA_API_KEY_URL, METER_API_KEY_URL, ACCOUNT_PRIVATE_KEY} = process.env;

const config: HardhatUserConfig = {
  solidity: "0.8.28",

  networks: {
    hardhat: {
    },
    sepolia: {
      url: ALCHEMY_SEPOLIA_API_KEY_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`]
    },
    liskSepolia: {
      url: LISK_API_KEY_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`]
    },
    amoy: {
      url: ALCHEMY_AMOY_API_KEY_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`]
    },
    meter: {
      url: METER_API_KEY_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`]
    },
  }
};

export default config;

