require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.18",
  networks: {
    hardhat: {
      forking: {
        url: process.env.ALCHEMY_MAINNET_RPC || process.env.INFURA_MAINNET_RPC, // Use Alchemy or Infura RPC
        blockNumber: 18100000, // Use a recent block for stability
      },
    },
  },
};
