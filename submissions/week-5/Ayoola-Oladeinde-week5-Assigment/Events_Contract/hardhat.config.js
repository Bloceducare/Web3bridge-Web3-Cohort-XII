require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.20',
  networks: {
    base: {
      url: process.env.API_KEY,
      accounts: [process.env.SECRET_KEY],
    },
  },
};
