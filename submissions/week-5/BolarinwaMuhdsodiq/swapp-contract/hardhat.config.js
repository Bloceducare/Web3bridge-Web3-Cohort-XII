require("@nomicfoundation/hardhat-toolbox");
const dotenv = require("dotenv")

dotenv.config();



const deployerPrivateKey =
  process.env.DEPLOYER_PRIVATE_KEY;
const etherscanApiKey = process.env.ETHERSCAN_API_KEY || "DNXJA8RX2Q3VZ4URQIWP7Z68CJXQZSC6AW";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
  version: "0.8.28",
  settings: {
    viaIR: true,
    optimizer: {
      enabled: true,
      runs: 200,
    },
  },
  
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
  },
  basetestnet: {
    url: "https://84532.rpc.thirdweb.com",
    accounts: [deployerPrivateKey],
  }
}

};
