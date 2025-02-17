import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

require("dotenv").config()

const {LISK_SEPOLIA_API_URL, ACCOUNT_PRIVATE_KEY} = process.env


const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    lisksepolia: {
      url: LISK_SEPOLIA_API_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`],
    },
  },
};

export default config;
