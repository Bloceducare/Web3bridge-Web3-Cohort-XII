import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { vars } from "hardhat/config";

const ALCHEMY_API_KEY = vars.get("ALCHEMY_API_KEY");
const BASE_SCAN_API_KEY = vars.get("BASE_SCAN_API_KEY"); //https://basescan.org/myaccount

const config: HardhatUserConfig = {
  solidity: "0.8.27",
  networks: {
    baseSepolia: {
      url: `https://base-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: vars.has("PRIVATE_KEY") ? [vars.get("PRIVATE_KEY")] : [],
    },
  },
  etherscan: {
    apiKey: BASE_SCAN_API_KEY,
    customChains: [
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org",
        },
      },
    ],
  },
};

export default config;
