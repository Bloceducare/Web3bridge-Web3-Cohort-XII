const { ethers } = require('hardhat');

const main = async () => {
  const ClassRegistration = await ethers.getContractFactory('ClassRegistration');
  const classRegistration = await ClassRegistration.deploy();
  await classRegistration.waitForDeployment();
  console.log('Class Registrationdeployed to:', await classRegistration.getAddress());
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
