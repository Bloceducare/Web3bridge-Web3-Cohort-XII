import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require('dotenv').config();

const { POLYGON_AMOY_API_KEY, PRIVATE_KEY, POLYGONSCAN_API_KEY } = process.env

const config: HardhatUserConfig = {
  solidity: "0.8.28",

  networks: {
    amoy: {
      url: POLYGON_AMOY_API_KEY, 
      accounts: [`0x${PRIVATE_KEY}`],
    },
  },
  etherscan: {
    apiKey: POLYGONSCAN_API_KEY,
    },
};

export default config;
