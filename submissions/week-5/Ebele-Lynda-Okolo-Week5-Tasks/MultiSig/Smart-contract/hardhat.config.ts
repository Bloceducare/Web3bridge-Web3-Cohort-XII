import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@typechain/hardhat";
import dotenv from "dotenv";
import fs from "fs";

// Load environment variables
dotenv.config();

const BASE_SEPOLIA_URL = process.env.BASE_SEPOLIA_URL || "https://rpc.sepolia-api.lisk.com";
const BASE_API_KEY = process.env.BASE_API_KEY || "123";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

// Load private keys from accounts.json if available
let privateKeys: string[] = [];
try {
    privateKeys = JSON.parse(fs.readFileSync("accounts.json", "utf8")).map((wallet: any) => wallet.privateKey);
} catch (error) {
    console.warn("⚠️ No accounts.json found! Ensure you generate accounts first.");
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    "lisk-sepolia": {
      url: BASE_SEPOLIA_URL,
      accounts: privateKeys.length > 0 ? privateKeys : [],
      chainId: 4202,
      allowUnlimitedContractSize: true,
      gas: 5000000,
      gasPrice: "auto"
    },
  },
  etherscan: {
    apiKey: {
      "lisk-sepolia": BASE_API_KEY,
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
};

export default config;