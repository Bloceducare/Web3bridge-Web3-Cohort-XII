import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config();

const {
  ACCOUNT_PRIVATE_KEY,
  ALCHEMY_SEPOLIA_API_KEY_URL,
  ALCHEMY_AMOY_API_KEY_URL,
  ETHERSCAN_API_KEY,
} = process.env;

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  defaultNetwork: "sepolia",
  networks: {
    hardhat: {},
    sepolia: {
      url: ALCHEMY_SEPOLIA_API_KEY_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`],
    },
    "lisk-sepolia": {
      url: "https://rpc.sepolia-api.lisk.com",
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`],
      gasPrice: 1000000000,
    },
    meter: {
      url: "https://rpctest.meter.io",
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`],
    },
    amoy: {
      url: ALCHEMY_AMOY_API_KEY_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`],
    },
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY || "",
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
      {
        network: "meter",
        chainId: 83,
        urls: {
          apiURL: "https://rpc.meter.io",
          browserURL: "https://rpctest.meter.io",
        }
      },
    ],
  },
  sourcify: {
    enabled: false,
  },
};

export default config;
