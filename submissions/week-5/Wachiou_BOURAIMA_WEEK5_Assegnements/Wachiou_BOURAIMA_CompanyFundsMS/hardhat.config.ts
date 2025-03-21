import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks : {
    hardhat: {
      accounts: {
        count: 30,
      }
    }
  }
};

export default config;
