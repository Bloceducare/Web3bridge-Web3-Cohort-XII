const { ethers} = require("hardhat");

const main = async () => {

  const EventContract = await ethers.getContractFactory("EventContract");
  const eventContract = await EventContract.deploy();
  await eventContract.waitForDeployment();
  console.log("Event Contract deployed to:", await eventContract.getAddress());
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
