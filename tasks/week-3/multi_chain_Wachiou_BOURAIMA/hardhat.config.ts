import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";


dotenv.config();
const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    hardhat: {},
    sepolia: {
      url: process.env.ALCHEMY_API_URL,
      accounts: [`0x${process.env.ACCOUNT_PRIVATE_KEY}`],
    },
    lisksepolia: {
      url: process.env.LISK_SEPOLIA_API_URL,
      accounts: [`0x${process.env.ACCOUNT_PRIVATE_KEY}`],
    },
    amoy: {
      url: process.env.AMOY_API_URL,
      accounts: [`0x${process.env.ACCOUNT_PRIVATE_KEY}`],
    },
    meter: {
      url: process.env.METER_API_URL,
      accounts: [`0x${process.env.ACCOUNT_PRIVATE_KEY}`],
    },
  },
etherscan: {
  apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;