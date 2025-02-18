import hre from "hardhat";
import EventContract from "../ignition/modules/EventContract";
import TicketFactory from "../ignition/modules/TicketFactory";

async function main() {
  console.log("Deploying TicketFactory...");
  const deployedFactory = await hre.ignition.deploy(TicketFactory);
  const ticketFactoryAddress = deployedFactory.ticketFactory.target;
  console.log("TicketFactory deployed at:", ticketFactoryAddress);

  console.log("Deploying EventContract...");
  const deployedEventFactory = await hre.ethers.getContractFactory("EventContract");
  const deployedEvent = await deployedEventFactory.deploy(ticketFactoryAddress);

  console.log("EventContract deployed at:", deployedEvent.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });