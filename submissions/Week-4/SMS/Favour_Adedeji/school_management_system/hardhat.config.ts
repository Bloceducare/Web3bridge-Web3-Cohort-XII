import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config();

const { ALCHEMY_SEPOLIA_API_URL, SEPOLIA_ACCOUNT_PRIVATE_KEY } = process.env;

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  // defaultNetwork: "sepolia",
  // networks: {
  //   sepolia: {
  //     url: ALCHEMY_SEPOLIA_API_URL,
  //     accounts: [`0x${SEPOLIA_ACCOUNT_PRIVATE_KEY}`]
  //   }
  // }
};

export default config;
