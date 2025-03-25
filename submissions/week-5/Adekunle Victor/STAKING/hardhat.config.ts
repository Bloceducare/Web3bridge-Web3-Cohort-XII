import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require('dotenv').config()
const {BASE_SEPOLIA_KEY, ACCOUNT_PRIVATE_KEY,WHITELISTED_PRIVATE_KEY , BASESCAN_KEY } = process.env;


const config: HardhatUserConfig = {
  solidity: "0.8.28",

  networks: {
    base: {
      url: BASE_SEPOLIA_KEY,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`, `0x${WHITELISTED_PRIVATE_KEY}`],
      chainId: 84532,
    },

    
  },
  etherscan: {
    apiKey: BASESCAN_KEY,
       
  }   
};

export default config;
