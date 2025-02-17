import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config()

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    lisk: {
      url: process.env.LISK_RPC,
      accounts: [`0x${process.env.PRIVATE_KEY}`]
    },
    sepolia: {
      url: process.env.ALCHEMY_SEPOLIA_API_KEY,
      accounts: [`0x${process.env.PRIVATE_KEY}`]
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};

export default config;
