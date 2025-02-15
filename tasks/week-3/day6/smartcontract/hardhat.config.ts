import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config"; // Use import instead of require for consistency

const { INFURA_SEPOLIA_API_KEY_URL, ACCOUNT_PRIVATE_KEY, ETHERSCAN_API_KEY } = process.env;

const config: HardhatUserConfig = {
  solidity: "0.8.28", 

  networks: {
    sepolia: {
      url: INFURA_SEPOLIA_API_KEY_URL, // Sepolia testnet URL
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`], // Private key for deployment
      gasPrice: 1000000000, // 1 Gwei (formatted for readability)
    },
  },
    etherscan: {
      apiKey: ETHERSCAN_API_KEY, // Add your Etherscan API key here
    },
};

export default config;
