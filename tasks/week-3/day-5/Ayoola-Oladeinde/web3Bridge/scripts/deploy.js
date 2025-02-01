const { ethers } = require('hardhat');

const main = async () => {
  const CarRental = await ethers.getContractFactory('CarRental');
  const carRental = await CarRental.deploy();
  await carRental.waitForDeployment();
  console.log('Car Rental deployed to:', await carRental.getAddress());
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
