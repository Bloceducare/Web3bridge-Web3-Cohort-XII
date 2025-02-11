import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";
// require("dotenv").config();

dotenv.config();
const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    hardhat: {},
    sepolia: {
      url: process.env.ALCHEMY_API_URL,
      accounts: [`0x${process.env.ACCOUNT_PRIVATE_KEY}`],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;