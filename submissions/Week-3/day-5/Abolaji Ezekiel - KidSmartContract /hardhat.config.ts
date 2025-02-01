import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require('dotenv').config();

const { ALCHEMY_API, ACCOUNT_PRIVATE_KEY, ETHERSCAN_API_KEY} = process.env;

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: ALCHEMY_API,
      accounts:  ACCOUNT_PRIVATE_KEY ? [ACCOUNT_PRIVATE_KEY]  : []
    }
  },
  etherscan: {
    apiKey:ETHERSCAN_API_KEY ,
  },
};

export default config;
