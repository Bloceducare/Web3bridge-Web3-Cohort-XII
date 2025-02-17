import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const EventFactory = await hre.ethers.getContractFactory("EventFactory");
  const eventFactory = await EventFactory.deploy();

  await eventFactory.waitForDeployment();

  console.log("EventFactory deployed to:", eventFactory.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});