import { ethers } from "hardhat";

async function main() {
  // Deploy the EventContract
  const eventContractFactory = await ethers.getContractFactory("EventContract");
  const eventContract = await eventContractFactory.deploy();

  await eventContract.deploymentTransaction().wait();

  console.log(
    `EventContract successfully deployed to: ${eventContract.address}`
  );

  // Set event details
  const startDate = Math.floor(Date.now() / 1000) + 1000;
  const endDate = startDate + 1000;
  const title = "Web3 Conference";
  const description = "A Web3 developer conference with great talks!";
  const eventType = 1; // Assuming 1 represents PAID event type
  const expectedGuestCount = 100;

  // Create an event
  const tx = await eventContract.createEvent(
    title,
    description,
    startDate,
    endDate,
    eventType,
    expectedGuestCount
  );

  const receipt = await tx.wait();

  console.log("Event created successfully with transaction receipt:", receipt);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
