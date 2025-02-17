import { ethers } from "hardhat";

async function main() {
  const contractAddress = "0x4806A915601c903a4A2C2d1c827CfB654214D644"; // Replace with latest contract
  const eventContract = await ethers.getContractAt("EventContract", contractAddress);

  console.log("📅 Fetching all events to find the latest valid one...");

  let validEventId = null;

  for (let i = 1; i <= 5; i++) { // Loop through first 5 event IDs
    try {
      const eventDetails = await eventContract.events(i);
      const startDate = Number(eventDetails._startDate);
      const endDate = Number(eventDetails._endDate);
      const ticketAddress = eventDetails._ticketAddress;

      console.log(`🔹 Event ID: ${i}, Start: ${new Date(startDate * 1000).toLocaleString()}, End: ${new Date(endDate * 1000).toLocaleString()}`);

      if (ticketAddress === ethers.ZeroAddress) {
        console.log(`❌ No ticket created for Event ID ${i}. Skipping...`);
        continue;
      }

      if (Date.now() / 1000 < endDate) {
        validEventId = i;
        break; // Use the first valid event found
      }
    } catch (error) {
      console.log(`❌ Event ID ${i} does not exist.`);
    }
  }

  if (!validEventId) {
    console.error("❌ No valid event found to register for.");
    return;
  }

  console.log(`✅ Selected Event ID: ${validEventId}`);

  // Fetch event details again for the selected event
  const eventDetails = await eventContract.events(validEventId);
  let startDate = Number(eventDetails._startDate);
  const endDate = Number(eventDetails._endDate);
  const ticketPrice = eventDetails._ticketPrice;

  console.log(`🔹 Event Start Date: ${new Date(startDate * 1000).toLocaleString()}`);
  console.log(`🔹 Event End Date: ${new Date(endDate * 1000).toLocaleString()}`);

  if (Date.now() / 1000 < startDate) {
    console.error("❌ EVENT NOT STARTED YET");
    return;
  }

  if (Date.now() / 1000 > endDate) {
    console.error("❌ EVENT HAS ENDED");
    return;
  }

  if (ticketPrice > 0) {
    console.log(`🎟️ Ticket Price: ${ethers.formatEther(ticketPrice)} ETH`);
  } else {
    console.log("🎟️ This is a free event. No payment required.");
  }

  console.log(`🚀 Purchasing ticket for Event ID: ${validEventId}...`);
  const tx = await eventContract.purchaseTicket(validEventId, { value: ticketPrice });

  console.log("⏳ Waiting for transaction confirmation...");
  await tx.wait();

  console.log(`✅ Ticket Purchased! Tx Hash: ${tx.hash}`);
}

main().catch((error) => {
  console.error("❌ Error purchasing ticket:", error);
  process.exit(1);
});
