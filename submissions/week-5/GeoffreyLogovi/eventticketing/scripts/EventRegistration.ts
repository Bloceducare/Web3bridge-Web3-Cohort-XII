import { ethers } from "hardhat";

async function main() {
  const eventId = 1; // Replace with your event ID

  // Get the deployed EventContract
  const eventContractFactory = await ethers.getContractFactory("EventContract");
  const eventContract = await eventContractFactory.attach("YOUR_DEPLOYED_CONTRACT_ADDRESS"); // Replace with your deployed contract address

  // Register for the event
  const tx = await eventContract.registerForEvent(eventId);
  const receipt = await tx.wait();

  console.log("Registered for event successfully with transaction receipt:", receipt);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
