import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config();

const { BASE_TESTNET, PRIVATE_KEY, ETHERSCAN_API_KEY } = process.env;

const config: HardhatUserConfig = {
  solidity: "0.8.28",

  networks: {
    basetestnet: {
      url: BASE_TESTNET,
      accounts: [`0x${PRIVATE_KEY}`]
      },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
    },
  };


export default config;
