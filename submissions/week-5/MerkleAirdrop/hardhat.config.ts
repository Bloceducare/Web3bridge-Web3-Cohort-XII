import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@typechain/hardhat";
require('dotenv').config();

const {
  BASE_SEPOLIA_RPC_URL,
  PRIVATE_KEY,
  BASESCAN_API_KEY,
  PRIVATE_KEY_DEPLOYER,
  PRIVATE_KEY_CLAIMER1,
  PRIVATE_KEY_CLAIMER2,
} = process.env;

// Ensure required environment variables are defined
if (!BASE_SEPOLIA_RPC_URL) {
  throw new Error('BASE_SEPOLIA_RPC_URL is not set in .env');
}
if (!PRIVATE_KEY_DEPLOYER) {
  throw new Error('PRIVATE_KEY_DEPLOYER is not set in .env');
}
if (!PRIVATE_KEY_CLAIMER1) {
  throw new Error('PRIVATE_KEY_CLAIMER1 is not set in .env');
}
if (!PRIVATE_KEY_CLAIMER2) {
  throw new Error('PRIVATE_KEY_CLAIMER2 is not set in .env');
}
if (!BASESCAN_API_KEY) {
  throw new Error('BASESCAN_API_KEY is not set in .env');
}

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    base: {
      url: BASE_SEPOLIA_RPC_URL,
      accounts: [
        PRIVATE_KEY_DEPLOYER.startsWith('0x') ? PRIVATE_KEY_DEPLOYER : `0x${PRIVATE_KEY_DEPLOYER}`,
        PRIVATE_KEY_CLAIMER1.startsWith('0x') ? PRIVATE_KEY_CLAIMER1 : `0x${PRIVATE_KEY_CLAIMER1}`,
        PRIVATE_KEY_CLAIMER2.startsWith('0x') ? PRIVATE_KEY_CLAIMER2 : `0x${PRIVATE_KEY_CLAIMER2}`,
      ].filter((key) => key !== ''),
    },
    localhost: {
      url: 'http://127.0.0.1:8545',
    },
  },
  etherscan: {
    apiKey: {
      base: BASESCAN_API_KEY,
    },
    customChains: [
      {
        network: 'base',
        chainId: 8453, // Base mainnet chain ID
        urls: {
          apiURL: 'https://api.basescan.org/api',
          browserURL: 'https://basescan.org',
        },
      },
    ],
  },
  sourcify: {
    enabled: false, // Disable Sourcify verification to suppress the warning
  },
  typechain: {
    outDir: 'typechain-types',
    target: 'ethers-v6',
  },
};

export default config;