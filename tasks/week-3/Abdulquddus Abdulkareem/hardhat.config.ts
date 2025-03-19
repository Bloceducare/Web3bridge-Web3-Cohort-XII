import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config();

const { ALCHEMY_API_KEY, PRIVATE_KEY, ETHERSCAN_API_KEY, ALCHEMY_AMOY_KEY_URL,ALCHEMY_LISK_SEPOLIA_API_KEY_URL,ALCHEMY_METER_KEY_URL  } = process.env;

const config: HardhatUserConfig = {
  solidity: "0.8.20",

  networks: {
    sepolia: {
      url: ALCHEMY_API_KEY,
      accounts: [`0x${PRIVATE_KEY}`]
  

    },
    polygonAmoy: {
      url: ALCHEMY_AMOY_KEY_URL,
      accounts: [`0x${PRIVATE_KEY}`]
    },
    SepoliaLisk: {
      url: ALCHEMY_LISK_SEPOLIA_API_KEY_URL,
      accounts: [`0x${PRIVATE_KEY}`]
    },
    meter: {
      url: ALCHEMY_METER_KEY_URL,
      accounts: [`0x${PRIVATE_KEY}`]
    },

  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
    },
  };


export default config;
