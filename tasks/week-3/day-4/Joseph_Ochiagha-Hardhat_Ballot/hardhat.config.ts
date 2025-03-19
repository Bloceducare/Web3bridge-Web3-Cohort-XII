import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { vars } from "hardhat/config";
import "@nomicfoundation/hardhat-ignition"; // ✅ Ensure this is imported

import dotenv from "dotenv";

dotenv.config();
const SEPOLIA_API_KEY =vars.get("SEPOLIA_API_KEY");
const POLYGON_API_KEY =vars.get("POLYGON_API_KEY");
const LISK_API_KEY =vars.get("LISK_API_KEY");



const config: HardhatUserConfig = {
  solidity: "0.8.19",
  ignition: {
    requiredConfirmations: 1
  },
  networks: {
    amoy: {
      url: process.env.POLYGON_RPC, // Replace with actual RPC URL
      accounts: [ `0x${process.env.POLYGON_PRIVATE_KEY!}`],
    },
    lisk_sepolia: {
      url: process.env.LISK_RPC, // Replace with actual RPC URL
      accounts: [`0x${process.env.LISK_PRIVATE_KEY!}`],
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC,
      accounts: [`0x${process.env.SEPOLIA_PRIVATE_KEY!}`],
    },
    meter_testnet: {
      url: process.env.METER_RPC, // Replace with actual RPC URL
      accounts: [`0x${process.env.METER_PRIVATE_KEY!}`],
    },
  },
  etherscan: {
    apiKey: {
      sepolia:SEPOLIA_API_KEY,  // For Sepolia
      polygonAmoy: POLYGON_API_KEY,  // For Amoy
     // meter: process.env.METER_API_KEY,  // For Meter
      liskSepolia: LISK_API_KEY,  // For Lisk Sepolia
    },
  },
  
};

export default config;
