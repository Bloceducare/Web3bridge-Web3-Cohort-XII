import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { vars } from "hardhat/config";

// const ALCHEMY_API_KEY = vars.get("ALCHEMY_API_KEY");
const CELOSCAN_API_KEY = vars.get("CELO_SCAN_API_KEY");

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    alfajores: {
      url: "https://alfajores-forno.celo-testnet.org",
      chainId: 44787,
      accounts: vars.has("PRIVATE_KEY") ? [vars.get("PRIVATE_KEY")] : [],
    },
  },
  etherscan: {
    apiKey: {
      alfajores: CELOSCAN_API_KEY,
    },
    customChains: [
      {
        network: "alfajores",
        chainId: 44787,
        urls: {
          apiURL: "https://api-alfajores.celoscan.io/api",
          browserURL: "https://alfajores.celoscan.io",
        },
      },
    ],
  },
};

export default config;
