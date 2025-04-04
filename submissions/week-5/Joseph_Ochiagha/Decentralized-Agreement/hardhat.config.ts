import { HardhatUserConfig, vars } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
// import "@nomiclabs/hardhat-waffle";
// import "@nomiclabs/hardhat-ethers";
// import dotenv from "dotenv";
const BASE_SEPOLIA_URL = vars.get("BASE_SEPOLIA_URL");
const PRIVATE_KEY = vars.get("PRIVATE_KEY");
const PRIVATE_KEY_1 = vars.get("PRIVATE_KEY_1");
const PRIVATE_KEY_2 = vars.get("PRIVATE_KEY_2");
const PRIVATE_KEY_3 = vars.get("PRIVATE_KEY_3");
const BASE_API_KEY = vars.get("BASE_API_KEY");
const ETHERSCAN_API_KEY = vars.get("ETHERSCAN_API_KEY");

// dotenv.config;

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    "lisk-sepolia": {
      url: "https://rpc.sepolia-api.lisk.com", // Updated to Lisk Sepolia
      accounts: [PRIVATE_KEY], // Added safety check
    },
  },
  etherscan: {
    // Use "123" as a placeholder, because Blockscout doesn't need a real API key, and Hardhat will complain if this property isn't set.
    apiKey: {
      "lisk-sepolia": "123",
    },
    customChains: [
      {
        network: "lisk-sepolia",
        chainId: 4202,
        urls: {
          apiURL: "https://sepolia-blockscout.lisk.com/api",
          browserURL: "https://sepolia-blockscout.lisk.com",
        },
      },
    ],
  },
  sourcify: {
    enabled: false,
  },
};

export default config;
