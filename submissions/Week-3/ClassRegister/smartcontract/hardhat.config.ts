import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config();

const { LISK_ALCHEMY_API_KEY, PRIVATE_KEY } = process.env;  

const config: HardhatUserConfig = {
  solidity: "0.8.28",

  networks: {
    lisk: {
      url: LISK_ALCHEMY_API_KEY,
      accounts: [`0x${PRIVATE_KEY}`],
    },
  }
};

export default config;
