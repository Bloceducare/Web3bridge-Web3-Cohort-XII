import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const { LISK_SEPOLIA_URL, ACCOUNT_PRIVATE_KEY } = process.env;

if (!LISK_SEPOLIA_URL || !ACCOUNT_PRIVATE_KEY) {
  throw new Error("❌ Missing environment variables in .env file!");
}

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    lisksepolia: {
      url: LISK_SEPOLIA_URL,
      accounts: [ACCOUNT_PRIVATE_KEY.startsWith("0x") ? ACCOUNT_PRIVATE_KEY : `0x${ACCOUNT_PRIVATE_KEY}`]
    }
  },
  etherscan: {
    apiKey: {
      lisksepolia: "123"
    },
    customChains: [
      {
        network: "lisksepolia",
        chainId: 4202,
        urls: {
          apiURL: "https://sepolia-blockscout.lisk.com/api",
          browserURL: "https://sepolia-blockscout.lisk.com"
        }
      }
    ]
  },
  sourcify: {
    enabled: false
  }
};

export default config;
