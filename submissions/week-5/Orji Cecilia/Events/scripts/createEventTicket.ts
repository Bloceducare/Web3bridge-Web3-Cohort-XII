import { ethers } from "hardhat";

async function main() {
  const contractAddress = "0x4806A915601c903a4A2C2d1c827CfB654214D644"; // Replace with latest deployed EventContract
  const eventId = 1; // Replace with the correct event ID
  const ticketName = "MyEventTicket";
  const ticketSymbol = "MET";

  console.log(`🎟 Creating ticket for Event ID: ${eventId}...`);

  // Get the EventContract instance
  const eventContract = await ethers.getContractAt("EventContract", contractAddress);

  const tx = await eventContract.createEventTicket(eventId, ticketName, ticketSymbol);
  await tx.wait();

  console.log("✅ Ticket created successfully!");
}

main().catch((error) => {
  console.error("❌ Error creating ticket:", error);
  process.exit(1);
});
