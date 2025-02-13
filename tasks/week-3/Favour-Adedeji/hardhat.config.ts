import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config()

const {
  ALCHEMY_SEPOLIA_API_KEY_URL,
  ALCHEMY_AMOY_API_KEY_URL,
  LISK_API_KEY_URL,
  METER_API_KEY_URL, 
  ACCOUNT_PRIVATE_KEY, 
  ETHERSCAN_API_KEY} = process.env

const config: HardhatUserConfig = {
  solidity: "0.8.28",

  defaultNetwork: "sepolia",
  networks: {
    sepolia: {
      url: ALCHEMY_SEPOLIA_API_KEY_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`]
    },
    amoy: {
      url: ALCHEMY_AMOY_API_KEY_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`]
    },
    lisk: {
      url: LISK_API_KEY_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`]
    },
    meter: {
      url: METER_API_KEY_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`]
    },
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY!
    }
  }
};
export default config;
