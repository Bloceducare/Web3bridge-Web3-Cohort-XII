import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

// Deploying contracts with the account: 0x5049be17c5d44Dc5f45c8B4bf3Fe6D73232696b6
// ProductManager deployed to: 0xE81ACDE3E0aFfCa94960a443b5A7bd0328881dC1

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: process.env.INFURA_PROJECT_ID ,
      accounts: process.env.PRIVATE_KEY ? [`0x${process.env.PRIVATE_KEY}`] : []
    }
  }
};

export default config;