import { ethers } from "hardhat";

async function main() {
  const eventContractAddress = "0xB2CB5D1E5D918447130Ac36ba653fA7d3e2Ac4e5"; // Replace with actual deployed contract address
  const signer = (await ethers.getSigners())[0]; // Get the first signer (deployer)

  // Connect to the deployed EventManagement contract
  const eventContract = await ethers.getContractAt("EventManagement", eventContractAddress, signer);

  console.log("Creating a new event...");

  const title = "Blockchain Summit";
  const description = "A premier event for blockchain enthusiasts";
  const startDate = Math.floor(Date.now() / 1000) + 86400; // Start in 1 day
  const endDate = Math.floor(Date.now() / 1000) + 172800; // Ends in 2 days
  const eventType = 1; // 0 = Free, 1 = Paid
  const expectedGuestCount = 100;

  try {
    const tx = await eventContract.createEvent(title, description, startDate, endDate, eventType, expectedGuestCount);
    await tx.wait();
    console.log("Event created successfully:", tx);
  } catch (error) {
    console.error(" Error creating event:", error);
  }
}

main().catch((error) => {
  console.error("Failed to execute script:", error);
  process.exitCode = 1;
});
