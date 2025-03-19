// import { HardhatUserConfig } from "hardhat/config";
// import "@nomicfoundation/hardhat-toolbox";

// const config: HardhatUserConfig = {
//   solidity: "0.8.28",
// };

// export default config;



import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ignition"; // ✅ Ensure this is imported

import dotenv from "dotenv"


dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC,
      accounts:[`0x${process.env.PRIVATE_KEY!}`],
    },
  },
  etherscan: {
    apiKey: process.env.SEPOLIA_API_KEY,
  },
};

export default config;


