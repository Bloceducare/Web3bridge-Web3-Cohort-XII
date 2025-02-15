import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require ('dotenv').config()

const { 
  ETHERSCAN_API_KEY, 
} = process.env

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  etherscan: {
    apiKey: ETHERSCAN_API_KEY
  },
  sourcify: {
    enabled: false
  }
};

export default config;