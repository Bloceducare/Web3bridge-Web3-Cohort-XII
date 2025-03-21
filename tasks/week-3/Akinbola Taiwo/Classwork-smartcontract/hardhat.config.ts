import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config();

const { ALCHEMY_SEPOLIA_API_KEY_URL, ACCOUNT_PRIVATE_KEY, ALCHEMY_METER_API_KEY_URL, ALCHEMY_POLYGON_API_KEY_URL, ALCHEMY_LISK_API_KEY_URL, ETHERSCAN_API_KEY} = process.env;

const config: HardhatUserConfig = {
  solidity: "0.8.20",

  networks: {
    
    sepolia: {
      url: ALCHEMY_SEPOLIA_API_KEY_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`],
    },
    polygon: {
      url: ALCHEMY_POLYGON_API_KEY_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`],
    },
    lisk: {
      url: ALCHEMY_LISK_API_KEY_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`],
    },
    meter: {
      url: ALCHEMY_METER_API_KEY_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`],
  }
}
etherscan: {
  apiKey: ETHERSCAN_API_KEY,
},
};
export default config;