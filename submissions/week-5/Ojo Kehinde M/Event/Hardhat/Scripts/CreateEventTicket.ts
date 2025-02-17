import { ethers } from "hardhat";

async function main() {
  const eventContractAddress = "0xB2CB5D1E5D918447130Ac36ba653fA7d3e2Ac4e5";
  const eventContract = await ethers.getContractAt("EventContract", eventContractAddress);

  console.log("🎟 Creating NFT ticket for the event...");
  const tx = await eventContract.createEventTicket(2, "BlockchainTicket", "BKT");
  await tx.wait();
  console.log(tx);

  const eventDetails = await eventContract.events(2);
  console.log(`✅ NFT Ticket Contract Created at: ${eventDetails._ticketAddress}`);
}

main().catch((error) => {
  console.error("❌ Failed to create NFT ticket:", error);
  process.exitCode = 1;
});
