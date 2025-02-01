import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require('dotenv').config();

const { SEPOLIA_ALCHEMY_API_KEY, PRIVATE_KEY, ETHERSCAN_API_KEY, AMOY_ALCHEMY_API_KEY, ALCHEMY_LISK_SEPOLIA_API_KEY_URL, ALCHEMY_METER_KEY_URL } = process.env;
const config: HardhatUserConfig = {
  solidity: "0.8.28",

  networks: {
    sepolia: {
      url: SEPOLIA_ALCHEMY_API_KEY,
      accounts: [`0x${PRIVATE_KEY}`],
    },
    amoy: {
      url: AMOY_ALCHEMY_API_KEY,
      accounts: [`0x${PRIVATE_KEY}`],
    },
    lisk: {
      url: ALCHEMY_LISK_SEPOLIA_API_KEY_URL,
      accounts: [`0x${PRIVATE_KEY}`],
    },
    meter: {
      url: ALCHEMY_METER_KEY_URL,
      accounts: [`0x${PRIVATE_KEY}`]
    }
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  }
};

export default config;
