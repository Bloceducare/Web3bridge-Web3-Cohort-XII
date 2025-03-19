import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require('dotenv').config();

const { LISK_SEPOLIA_URL, ACCOUNT_PRIVATE_KEY } = process.env;

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks : {
    lisk_sepolia: {
      url: LISK_SEPOLIA_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`]
  }
},
etherscan: {
  apiKey: {
    "lisk-sepolia": "123"
  },
  customChains: [
    {
        network: "lisk-sepolia",
        chainId: 4202,
        urls: {
            apiURL: "https://sepolia-blockscout.lisk.com/api",
            browserURL: "https://sepolia-blockscout.lisk.com"
        }
    }
  ]
},
sourcify: {
  enabled: false
}
};

export default config;
