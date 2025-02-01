import "@nomiclabs/hardhat-ethers";
import "dotenv/config"; // Better way to load environment variables
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ignition"; // Import Hardhat Ignition plugin

const config: HardhatUserConfig = {
  solidity: "0.8.0",
  networks: {
    sepolia: {
      url: process.env.INFURA_PROJECT_ID || "", // This should be the full URL, not just the ID
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
};

export default config;