import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require('dotenv').config()

const { INFURA_SEPOLIA_API_KEY_URL, ACCOUNT_PRIVATE_KEY } = process.env

const config: HardhatUserConfig = {
  solidity: "0.8.28",

networks : {
  sepolia: {
    url: INFURA_SEPOLIA_API_KEY_URL,
    accounts: [`0x${ACCOUNT_PRIVATE_KEY}`],
    gasPrice: 1000000000, // 1 Gwei
  }
}
};

export default config;
