import { HardhatUserConfig } from "hardhat/config";
  import { vars } from "hardhat/config";
  import "@nomicfoundation/hardhat-toolbox";
  require('dotenv').config(); 


  const { ALCHEMY_SEPOLIA_API_KEY_URL, ACCOUNT_PRIVATE_KEY} = process.env;

  const ETHERSCAN_API_KEY=vars.get("ETHERSCAN_API_KEY");

  if (!ALCHEMY_SEPOLIA_API_KEY_URL || !ACCOUNT_PRIVATE_KEY) {
    throw new Error("Missing environment variables. Check your .env file.");
  }
  const config: HardhatUserConfig = {
    solidity: "0.8.20",

    networks :{
      sepolia : {
        url: ALCHEMY_SEPOLIA_API_KEY_URL,
        accounts: [`0x${ACCOUNT_PRIVATE_KEY}`]
      }
    },
    etherscan: {
      apiKey: ETHERSCAN_API_KEY,
        
    },
  };

  export default config;