import hre from "hardhat";

async function main() {
  const EventFactory = await hre.ethers.getContractFactory("EventContract")

  const event = await EventFactory.deploy();

  const deployedAddress = await event.getAddress()

  console.log(`Deployed contract to: `, deployedAddress);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});