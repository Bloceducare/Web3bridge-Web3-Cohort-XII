import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { vars } from "hardhat/config";
require('dotenv').config()

const {ALCHEMY_SEPOLIA_API_URL, ACCOUNT_PRIVATE_KEY, ALCHEMY_AMOY_API_URL, LISK_SEPOLIA_RPC_URL,METER_TESTNET_RPC_URL } = process.env
const ETHERSCAN_API_KEY = vars.get("ETHERSCAN_API_KEY");
const config: HardhatUserConfig = {
  solidity: "0.8.28",

  networks: {
    sepolia: {
      url: ALCHEMY_SEPOLIA_API_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`] 
    },
    amoy: {
      url: ALCHEMY_AMOY_API_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`],
    },
    lisk_sepolia: {
      url: LISK_SEPOLIA_RPC_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`],
    },
    meter_testnet: {
      url: METER_TESTNET_RPC_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`],
    },
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY,
    },
  },
};

export default config;
