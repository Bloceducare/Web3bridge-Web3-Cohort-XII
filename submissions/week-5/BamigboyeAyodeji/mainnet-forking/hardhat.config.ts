import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.28",

  networks: {
    hardhat: {
      forking: {
        url: "https://mainnet.infura.io/v3/<key>",
      }
    }
  }
};

export default config;