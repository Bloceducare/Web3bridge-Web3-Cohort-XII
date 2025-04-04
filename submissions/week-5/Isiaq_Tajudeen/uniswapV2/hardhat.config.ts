import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { vars } from "hardhat/config";

const ALCHEMY_API_KEY = vars.get("ALCHEMY_API_KEY");

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    forking: {
      url: "https://eth-mainnet.g.alchemy.com/v2/Ln87QZD-UfNQuAT5K1RqBUXJu3mma_HG",
    },
  },
};

export default config;
