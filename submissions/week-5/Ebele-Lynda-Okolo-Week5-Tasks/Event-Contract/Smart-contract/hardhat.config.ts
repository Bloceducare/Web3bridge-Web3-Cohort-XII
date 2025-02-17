import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const BASE_SEPOLIA_URL = process.env.BASE_SEPOLIA_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const BASE_API_KEY = process.env.BASE_API_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    "lisk-sepolia": {
      url: BASE_SEPOLIA_URL || "https://rpc.sepolia-api.lisk.com", // Use env variable or default
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: {
      "lisk-sepolia": "123", // Blockscout workaround
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
