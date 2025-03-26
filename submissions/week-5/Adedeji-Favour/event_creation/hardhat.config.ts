import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config()


const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    lisk: {
      url: process.env.LISK_RPC,
      accounts: [`0x${process.env.PRIVATE_KEY}`]
    }
  }
};

export default config;
