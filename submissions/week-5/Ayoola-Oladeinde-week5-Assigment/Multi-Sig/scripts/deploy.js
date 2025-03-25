const { ethers } = require('hardhat');
require('dotenv').config();

const main = async () => {
  const MultiSigBoard = await ethers.getContractFactory('MultiSigBoard');
  const multisig = await MultiSigBoard.deploy();
  await multisig.waitForDeployment();
  console.log('multisig deployed to:', await multisig.getAddress());
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
runMain();
