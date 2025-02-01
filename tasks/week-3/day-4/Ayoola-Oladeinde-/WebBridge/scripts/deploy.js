const { ethers } = require('hardhat');

const main = async () => {
  const proposalNames = [
    '0x6361720000000000000000000000000000000000000000000000000000000000', // "car"
    '0x62696b6500000000000000000000000000000000000000000000000000000000',
  ]; // "bike"

  const Ballot = await ethers.getContractFactory('Ballot');
  const ballot = await Ballot.deploy();
  await ballot.waitForDeployment();
  console.log('Ballot deployed to:', await ballot.getAddress());
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
