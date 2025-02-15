require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.20',
  networks: {
    amoy: {
      url: process.env.AMOY_API_KEY,
      accounts: [process.env.SECRET_KEY],
    },
    sepolia: {
      url: process.env.SEPOLIA_API_KEY,
      accounts: [process.env.SECRET_KEY],
    },
    lisk: {
      url: process.env.LISK_API_KEY,
      accounts: [process.env.SECRET_KEY],
    },
    meter: {
      url: process.env.METER_API_KEY,
      accounts: [process.env.SECRET_KEY],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
