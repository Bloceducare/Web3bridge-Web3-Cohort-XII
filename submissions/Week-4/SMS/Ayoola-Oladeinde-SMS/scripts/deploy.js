const { ethers } = require('hardhat');

const main = async () => {
  const SchoolSystem = await ethers.getContractFactory('SchoolSystem');
  const schoolSystem = await SchoolSystem.deploy();
  await schoolSystem.waitForDeployment();
  console.log('School System deployed to:', await schoolSystem.getAddress());
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
