const { ethers } = require('hardhat');

const main = async () => {
  const SavingsContract = await ethers.getContractFactory('SavingsContract');
  const savingsContract = await SavingsContract.deploy();
  await savingsContract.waitForDeployment();
  console.log('Savings Contract deployed to:', await savingsContract.getAddress());
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
