import { HardhatUserConfig } from "hardhat/config";
import '@matterlabs/hardhat-zksync';
import "@nomicfoundation/hardhat-toolbox";
// import "@matterlabs/hardhat-zksync-verify";
require('dotenv').config();

const {
  ALCHEMY_SEPOLIA_API_URL,
  ACCOUNT_PRIVATE_KEY,
  ZKSYNC_SEPOLIA_API_URL,
  ZKSYNC_API_KEY,
} = process.env;

if (!ACCOUNT_PRIVATE_KEY) {
  throw new Error("Missing ACCOUNT_PRIVATE_KEY in environment variables");
}

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  ignition: {
    requiredConfirmations: 1
  },
  networks: {
    sepolia: {
      url: ALCHEMY_SEPOLIA_API_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`],
    },
    zksync_sepolia: {
      url: ZKSYNC_SEPOLIA_API_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`],
    },
    // zkSyncSepoliaTestnet: {
    //   url: 'https://sepolia.era.zksync.dev',
    //   accounts: [`0x${ACCOUNT_PRIVATE_KEY}`],
    //   ethNetwork: 'sepolia',
    //   zksync: true,
    //   verifyURL: 'https://explorer.sepolia.era.zksync.dev/contract_verification',
    // },
    op_sepolia: {
      url: `https://sepolia.optimism.io`,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`],
    },
    base_sepolia: {
      url: `https://sepolia.base.org`,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`],
    },
  },
  etherscan: {
    apiKey: {
      zksyncsepolia: ZKSYNC_API_KEY || "",
    },
  },
  sourcify: {
    enabled: true,
  },
};

export default config;