require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config()

const { 
  ALCHEMY_SEPOLIA_API_KEY_URL, 
  ACCOUNT_PRIVATE_KEY, 
  ETHERSCAN_API_KEY,
  ALCHEMY_POLYGON_API_KEY_URL ,
  ALCHEMY_LISK_API_KEY_URL,
  ALCHEMY_METER_API_KEY_URL
} = process.env

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: ALCHEMY_SEPOLIA_API_KEY_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`]
    },

    polygon_Amoy: {
      url: ALCHEMY_POLYGON_API_KEY_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`]
    },

    lisk: {
      url: ALCHEMY_LISK_API_KEY_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`]
    },

    meter: {
      url: ALCHEMY_METER_API_KEY_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`]
    },
  },

  etherscan: {
    apiKey: ETHERSCAN_API_KEY
  }
};
