import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config();

const { ALCHEMY_API_KEY, PRIVATE_KEY, ETHERSCAN_API_KEY } = process.env;

const config: HardhatUserConfig = {
  solidity: "0.8.28",
    
    networks: {
    sepolia: {
      url: ALCHEMY_API_KEY,
      accounts: [`0x${PRIVATE_KEY}`]
      },
    },
    etherscan: {
      apiKey: ETHERSCAN_API_KEY,
      },
  };

export default config;
