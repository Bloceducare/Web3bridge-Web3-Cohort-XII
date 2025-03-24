import { ethers } from "hardhat";
import fs from "fs";

// Utility function to get deployed addresses
async function getDeployedAddresses() {
  const network = process.env.HARDHAT_NETWORK || "base_sepolia";
  const deploymentPath = `./deployments/${network}.json`;
  
  if (!fs.existsSync(deploymentPath)) {
    throw new Error(`No deployment found for network ${network}`);
  }
  
  return JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
}

// Create a new event
async function createEvent() {
  const { eventFactory: factoryAddress, based: paymentToken } = await getDeployedAddresses();
  const factory = await ethers.getContractAt("EventFactory", factoryAddress);

  const oneDay = 24 * 60 * 60;
  const startDate = Math.floor(Date.now() / 1000) + oneDay; // Start tomorrow
  const endDate = startDate + (7 * oneDay); // End in a week

  const tx = await factory.createEvent(
    "My Test Event",
    startDate,
    endDate,
    0, // FREE event
    100, // maxCapacity
    "Test Ticket",
    "TTK",
    paymentToken, // Payment token address
    ethers.parseEther("0.01") // ticketPrice
  );

  const receipt = await tx.wait();
  console.log("Event created! Transaction:", receipt.transactionHash);

  // Search for the EventCreated event in the receipt
  const eventCreated = receipt.events?.find((e: any) => e.event === "EventCreated");
  if (!eventCreated || !eventCreated.args) {
    throw new Error("Failed to extract event");
  }
  
  const eventId = eventCreated.args.eventId;
  console.log("Extracted eventId:", eventId.toString());
  return eventId.toNumber();
}


// Buy ticket for an event
async function buyTicket(eventId: number) {
  const { eventFactory: factoryAddress } = await getDeployedAddresses();
  const factory = await ethers.getContractAt("EventFactory", factoryAddress);

  const tx = await factory.buyTicket(eventId);
  const receipt = await tx.wait();
  if (receipt) {
    console.log("Ticket purchased! Transaction:", receipt.hash);
  } else {
    console.error("Failed to purchase ticket: receipt is null");
  }
  return receipt;
}

// Verify attendance
async function verifyAttendance(eventId: number, attendeeAddress: string) {
  const { eventFactory: factoryAddress } = await getDeployedAddresses();
  const factory = await ethers.getContractAt("EventFactory", factoryAddress);

  const tx = await factory.verifyAttendance(eventId, attendeeAddress);
  const receipt = await tx.wait();
  if (receipt) {
    console.log("Attendance verified! Transaction:", receipt.hash);
  } else {
    console.error("Failed to verify attendance");
  }
  return receipt;
}

// Main function to run all interactions
async function main() {
  try {
    // Create an event
    console.log("\nCreating event...");
    const eventId = await createEvent();

    // Register for the event
    console.log("\nBuying ticket...");
    await buyTicket(eventId);

    // Get a signer's address for verification
    const [signer] = await ethers.getSigners();
    
    // Verify attendance
    console.log("\nVerifying attendance...");
    await verifyAttendance(eventId, await signer.getAddress());

  } catch (error) {
    console.error("Error:", error);
    process.exitCode = 1;
  }
}

// Execute if running this script directly
if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
