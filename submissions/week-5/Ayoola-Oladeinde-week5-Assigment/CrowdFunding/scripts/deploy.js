const { ethers } = require('hardhat');
require('dotenv').config();

const main = async () => {
  const TokenA = await ethers.getContractFactory('TokenA');
  const tokenA = await TokenA.deploy(
    '0xf04990915C006A35092493094B4367F6d93f9ff0',
    '0xf04990915C006A35092493094B4367F6d93f9ff0'
  );
  await tokenA.waitForDeployment();
  console.log('token deployed to:', await tokenA.getAddress());

  const Crowdfunding = await ethers.getContractFactory(
    'DecentralizedCrowdfunding'
  );
  const crowdFunding = await Crowdfunding.deploy();
  await crowdFunding.waitForDeployment();
  console.log('Airdrop deployed to:', await crowdFunding.getAddress());
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
