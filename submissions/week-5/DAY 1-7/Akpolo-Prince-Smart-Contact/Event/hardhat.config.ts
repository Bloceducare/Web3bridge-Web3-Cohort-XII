import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";

dotenv.config();

const { BASE_SEPOLIA_KEY, ACCOUNT_PRIVATE_KEY, BASESCAN_KEY } = process.env;

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  sourcify: {
    enabled: true
  },
  networks: {
    base: {
      url: BASE_SEPOLIA_KEY || "",  // Prevent undefined error
      accounts: ACCOUNT_PRIVATE_KEY ? [`0x${ACCOUNT_PRIVATE_KEY}`] : [],
      chainId: 84532,
    },
  },
  etherscan: {
    apiKey: BASESCAN_KEY || "",
  },
};

export default config;
