import { HardhatUserConfig, vars } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";
dotenv.config();

const BASE_SEPOLIA_URL = vars.get("BASE_SEPOLIA_URL");
const PRIVATE_KEY = vars.get("PRIVATE_KEY");
const PRIVATE_KEY_1 = vars.get("PRIVATE_KEY_1");
const PRIVATE_KEY_2 = vars.get("PRIVATE_KEY_2");
const PRIVATE_KEY_3 = vars.get("PRIVATE_KEY_3");

const BASE_API_KEY = vars.get("BASE_API_KEY");
const ETHERSCAN_API_KEY = vars.get("ETHERSCAN_API_KEY");

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    hardhat: {
      accounts: {
        count: 25, // Increased number of accounts
        accountsBalance: "10000000000000000000000", // 10000 ETH per account
      },
    },
    "base-sepolia": {
      url: BASE_SEPOLIA_URL || "https://sepolia.base.org",
      accounts: [PRIVATE_KEY, PRIVATE_KEY_1, PRIVATE_KEY_2, PRIVATE_KEY_3],
    },
  },
  etherscan: {
    apiKey: {
      "base-sepolia": BASE_API_KEY,
    },
    customChains: [
      {
        network: "base-sepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org",
        },
      },
    ],
  },
  sourcify: {
    enabled: true,
  },
};

export default config;
