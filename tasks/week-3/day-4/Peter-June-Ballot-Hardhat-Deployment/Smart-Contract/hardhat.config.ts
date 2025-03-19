import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import { vars } from 'hardhat/config';
require('dotenv').config();

const {
  ALCHEMY_SEPOLIA_API_KEY_URL,
  ALCHEMY_LISK_SEPOLIA_API_KEY_URL,
  ALCHEMY_AMOY_API_KEY_URL,
  ALCHEMY_METER_KEY_URL,
  ACCOUNT_PRIVATE_KEY,
} = process.env;

const ETHERSCAN_API_KEY = vars.get('ETHERSCAN_API_KEY');

const config: HardhatUserConfig = {
  solidity: '0.8.28',
  networks: {
    sepolia: {
      url: ALCHEMY_SEPOLIA_API_KEY_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`],
    },
    amoy: {
      url: ALCHEMY_AMOY_API_KEY_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`],
    },
    lisk_sepolia: {
      url: ALCHEMY_LISK_SEPOLIA_API_KEY_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`],
    },
    meter: {
      url: ALCHEMY_METER_KEY_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`],
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
};

export default config;
