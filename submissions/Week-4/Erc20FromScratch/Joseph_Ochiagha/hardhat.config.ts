import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv"
dotenv.config()


const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    liskSepolia: {
      url: "https://rpc.sepolia-api.lisk.com",
      chainId: 4202, // Lisk Sepolia RPC
      accounts: [`0x${process.env.PRIVATE_KEY}`],
    },
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/GMxG4ZV6bLtoDSqul2FgbP3F0fS1lODk", // Replace with actual RPC URL
      chainId: 11155111,
      accounts: [`0x${process.env.PRIVATE_KEY}`],
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API, // Blockscout API key
   
  },
  sourcify: {
    enabled: true,
    apiUrl: "https://server-verify.hashscan.io",
    browserUrl: "https://repository-verify.hashscan.io",
  },
};


export default config;
