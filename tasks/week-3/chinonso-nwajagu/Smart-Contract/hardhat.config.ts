import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import "dotenv/config";

const { ALCHEMY_SEPOLIA_API_KEY_URL, PRIVATE_KEY} = process.env;

if (!ALCHEMY_SEPOLIA_API_KEY_URL || !PRIVATE_KEY) {
  throw new Error("Missing environment variables. Check your .env file.");
}

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  //0x9F04154BFB0b82Cf491dC93158991F082b185cCc
  networks: {
    sepolia: {
      url: ALCHEMY_SEPOLIA_API_KEY_URL,
      accounts: [`0x${PRIVATE_KEY}`], 
    },
    //0x1636B22539918513b6042283C1Bf65CeF9F1E144
    amoy: {
      url: "https://polygon-amoy.g.alchemy.com/v2/bmausb9T8EpBjJc_BjBbPUlhmI-s5hjw",
      accounts: [`0x${PRIVATE_KEY}`],
    },
    //0x282949636dBea27cE9FFedBC287E6FF93697f58a
    lisk_sepolia: {
      url:"https://rpc.sepolia-api.lisk.com",
      accounts: [`0x${PRIVATE_KEY}`],
    },
    meter: {
      url:"https://rpctest.meter.io",
      accounts: [`0x${PRIVATE_KEY}`],
    }
  },

  // etherscan: {
  //   apiKey: ETHERSCAN_API_KEY, // Corrected to use the environment variable
  // },

  sourcify: {
    enabled: true, // Sourcify verification enabled
  }
};

export default config;
