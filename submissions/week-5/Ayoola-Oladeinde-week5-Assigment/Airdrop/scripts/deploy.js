const { ethers } = require('hardhat');
require('dotenv').config();

const main = async () => {
  const Tanab = await ethers.getContractFactory('Tanab');
  const tanab = await Tanab.deploy(
    '0xf04990915C006A35092493094B4367F6d93f9ff0',
    '0xf04990915C006A35092493094B4367F6d93f9ff0'
  );
  await tanab.waitForDeployment();
  console.log('token deployed to:', await tanab.getAddress());

  const Airdrop = await ethers.getContractFactory('Airdrop');
  const airDrop = await Airdrop.deploy(await tanab.getAddress());
  await airDrop.waitForDeployment();
  console.log('Airdrop deployed to:', await airDrop.getAddress());
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
