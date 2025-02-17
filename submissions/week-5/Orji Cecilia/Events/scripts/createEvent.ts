import { ethers } from "hardhat";

async function main() {
  const factoryAddress = "0x3dE4B080e9dcE1C6959Fd6a95909880383d43737"; // Replace with correct factory address
  const factory = await ethers.getContractAt("EventFactory", factoryAddress);

  console.log("🚀 Creating new EventContract...");

  // Deploy a new EventContract from the factory
  const tx = await factory.createEventContract();
  await tx.wait();

  console.log("✅ New EventContract deployed!");

  // Get the latest deployed EventContract address
  const deployedEvents = await factory.getDeployedEvents();
  const eventAddress = deployedEvents[deployedEvents.length - 1];
  console.log(`📜 EventContract deployed at: ${eventAddress}`);

  // Attach to the newly created EventContract
  const eventContract = await ethers.getContractAt("EventContract", eventAddress);

  // ✅ Set a valid start date and end date
  const title = "Web3 Summit";
  const description = "The biggest blockchain conference!";
  const startDate = Math.floor(Date.now() / 1000) + 60; // 1 minute from now
  // const startDate = Math.floor(Date.now() / 1000) + 5;  // 5 seconds from now
  const endDate = startDate + (24 * 60 * 60); // 1 day later
  const eventType = 1; // 0 = Free, 1 = Paid
  const expectedGuestCount = 100;
  const ticketPrice = ethers.parseEther("0.01"); // 0.01 ETH per ticket

  console.log("🎟 Creating Event with valid timestamps...");
  const eventTx = await eventContract.createEvent(
    title,
    description,
    startDate,
    endDate,
    eventType,
    expectedGuestCount,
    ticketPrice
  );
  await eventTx.wait();

  console.log(`✅ Event Created Successfully! Start: ${new Date(startDate * 1000).toLocaleString()}, End: ${new Date(endDate * 1000).toLocaleString()}`);
}

main().catch((error) => {
  console.error("❌ Event creation failed:", error);
  process.exit(1);
});
