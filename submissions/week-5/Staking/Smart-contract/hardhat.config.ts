import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require('dotenv').config()

const { BASE_SEPOLIA_RPC_URL, PRIVATE_KEY, BASESCAN_API_KEY } = process.env

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    base: {
      url: BASE_SEPOLIA_RPC_URL,
      accounts: [`0x${PRIVATE_KEY}`],
    },
  },
  etherscan: {
    apiKey: BASESCAN_API_KEY,
  },
sourcify: {
  enabled: false, // Disable Sourcify verification to suppress the warning
},
};

export default config;