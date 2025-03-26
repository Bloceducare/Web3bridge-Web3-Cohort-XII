import hre from "hardhat";

async function main() {
  const StakingFactory = await hre.ethers.getContractFactory("EventContract")

  const event = await StakingFactory.deploy();

  const deployedAddress = await event.getAddress()

  console.log(`Deployed contract to: ${deployedAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});