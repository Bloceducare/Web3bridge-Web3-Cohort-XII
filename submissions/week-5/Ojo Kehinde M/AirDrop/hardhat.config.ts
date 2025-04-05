import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ethers";
import dotenv from "dotenv"

require('dotenv').config()

const {BASE_SEPOLIA_RPC_URL, PRIVATE_KEY, BASESCAN_KEY } = process.env;


const config: HardhatUserConfig = {
  solidity: "0.8.28",

  networks: {
    base: {
      url: BASE_SEPOLIA_RPC_URL,
      accounts: [`0x${PRIVATE_KEY}`],
      chainId: 84532,
    },

    
  },
  etherscan: {
    apiKey: BASESCAN_KEY,
       
  }   
};

export default config;