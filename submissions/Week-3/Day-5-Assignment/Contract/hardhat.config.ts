import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import "dotenv/config";

const { ALCHEMY_SEPOLIA_API_KEY_URL, PRIVATE_KEY,} = process.env;

if (!ALCHEMY_SEPOLIA_API_KEY_URL || !PRIVATE_KEY ) {
  throw new Error("Missing environment variables. Check your .env file.");
}

const config: HardhatUserConfig = {

  //0xb7E4add708C64722d781f6406550fc9661c50d5B
  solidity: "0.8.28",

  networks: {
    sepolia: {
      url: ALCHEMY_SEPOLIA_API_KEY_URL,
      accounts: [`0x${PRIVATE_KEY}`], 
    },
    
  },

    etherscan: {
    apiKey: "9ZFIF17WYWHAYVUJP65E3CFCWMU1K8FWGI", // Corrected to use the environment variable
  },

  sourcify: {
    enabled: true, // Sourcify verification enabled
  }
};

export default config;
