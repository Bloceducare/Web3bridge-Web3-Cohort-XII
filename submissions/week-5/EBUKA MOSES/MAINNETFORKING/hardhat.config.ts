import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
};

export default config;




// import { HardhatUserConfig } from "hardhat/config";
// import "@nomicfoundation/hardhat-toolbox";
// import * as dotenv from "dotenv";

// dotenv.config();

// const config: HardhatUserConfig = {
//   solidity: {
//     compilers: [
//       {
//         version: "0.8.28",
//         settings: {
//           optimizer: {
//             enabled: true,
//             runs: 200,
//           },
//         },
//       },
//     ],
//   },

//   networks: {
//     hardhat: {
//       forking: {
//         url: process.env.ALCHEMY_SEPOLIA_API_KEY_URL || "",
//       },
//       gasPrice: 10000000000,
//     },
//   },

//   mocha: {
//     timeout: 1800000,
//   },
// };

// export default config;