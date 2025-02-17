import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
require("dotenv").config(); 

const { 
  ALCHEMY_BASE_SEPOLIA_API_KEY_URL,
  ACCOUNT_PRIVATE_KEY, 
  BASESCAN_API_KEY 
} = process.env;

const config: HardhatUserConfig = {
  solidity: "0.8.28",

  networks: {
    base_sepolia: {
      url: ALCHEMY_BASE_SEPOLIA_API_KEY_URL,
      accounts: ACCOUNT_PRIVATE_KEY ? [`0x${ACCOUNT_PRIVATE_KEY}`] : [],
      timeout: 120000, 
    },
  },

  etherscan: {
    apiKey: BASESCAN_API_KEY,
  },
};

export default config;
