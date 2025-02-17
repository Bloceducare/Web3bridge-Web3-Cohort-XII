
require("@nomicfoundation/hardhat-toolbox");
const dotenv = require("dotenv")
require("solidity-coverage");
require("@nomicfoundation/hardhat-verify");
dotenv.config();
// Amoy
// Lisk Sepolia
// Sepolia
// Note: Verify the contract you deploy to the Sepolia testnet.
// Meter
// https://rpc-sepolia.rockx.com

const deployerPrivateKey =
  process.env.DEPLOYER_PRIVATE_KEY;
const etherscanApiKey = process.env.ETHERSCAN_API_KEY || "DNXJA8RX2Q3VZ4URQIWP7Z68CJXQZSC6AW";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  namedAccounts: {
    deployer: {
      // By default, it will take the first Hardhat account as the deployer
      default: 0,
    },
  },
  ignition: {
    requiredConfirmations: 1
  },
  networks: {
    Amoy: {
      url: "https://rpc-amoy.polygon.technology",
      accounts: [deployerPrivateKey],
    },
    liskSepolia: {
      url: "https://rpc.sepolia-api.lisk.com",
      accounts: [deployerPrivateKey],
    },
    sepolia: {
      url: "https://sepolia.gateway.tenderly.co",
      accounts: [deployerPrivateKey],
    },
    meter: {
      url: "https://rpctest.meter.io",
      accounts: [deployerPrivateKey],
    }
  },
  etherscan: {
    apiKey: `${etherscanApiKey}`,
  },
  verify: {
    etherscan: {
      apiKey: `${etherscanApiKey}`,
    },
  },
};
