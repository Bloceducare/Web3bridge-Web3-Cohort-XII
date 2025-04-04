import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    hardhat: {
      forking: {
        url: "https://eth-mainnet.g.alchemy.com/v2/bqE0gTvMfZXRD9f-VtioI31TbMBhPx03",
      },
    },
  },
};

export default config;