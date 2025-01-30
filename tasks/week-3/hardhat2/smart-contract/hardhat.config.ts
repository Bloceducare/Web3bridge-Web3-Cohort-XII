import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();


const PRIVATE_KEY = process.env.PRIVATE_KEY ?? (function() { throw new Error("PRIVATE_KEY not set in environment"); })();

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    amoy: {
      url: process.env.AMOY_RPC_URL,
      accounts: [PRIVATE_KEY],
    },
   
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
   
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY, // Used for verifying Sepolia deployment
  },
};

export default config;



