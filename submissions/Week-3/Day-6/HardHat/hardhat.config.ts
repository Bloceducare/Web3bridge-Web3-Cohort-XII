import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config();


import { vars } from "hardhat/config";

const { LISK_API_KEY_URL, ACCOUNT_PRIVATE_KEY } = process.env;
const ETHERSCAN_API_KEY = vars.get("ETHERSCAN_API_KEY");



const config: HardhatUserConfig = {
  solidity: "0.8.20",

networks: {
    
  lisksepolia: {
    url: LISK_API_KEY_URL,
    accounts: [`0x${ACCOUNT_PRIVATE_KEY}`],
  },
  
},

etherscan: {
  apiKey: {
    sepolia: ETHERSCAN_API_KEY,
  },
},


};

export default config;

