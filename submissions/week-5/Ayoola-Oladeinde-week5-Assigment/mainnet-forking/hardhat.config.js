require('@nomicfoundation/hardhat-toolbox');

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.28',
  paths: {
    sources: './contracts',
  },
  networks: {
    hardhat: {
      forking: {
        url: 'https://eth-mainnet.g.alchemy.com/v2/no-tCXj1V0r5oeMGjUCqbOcWA-vmwA1P',
        blockNumber: 21865325,
      },
    },
  },
};
