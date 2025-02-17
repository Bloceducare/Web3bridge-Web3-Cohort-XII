import { ethers } from "hardhat";

async function main() {
  const contractAddress = "0x4806A915601c903a4A2C2d1c827CfB654214D644"; // Replace with correct address
  const [signer] = await ethers.getSigners();
  
  console.log(`🔍 Checking NFT Ownership for: ${signer.address}`);

  const eventContract = await ethers.getContractAt("EventContract", contractAddress);
  const eventDetails = await eventContract.events(1); // Check Event ID 1
  
  if (eventDetails._ticketAddress === ethers.ZeroAddress) {
    console.log("❌ No ticket contract associated with this event.");
    return;
  }

  const ticketContract = await ethers.getContractAt("Tickets", eventDetails._ticketAddress);
  const balance = await ticketContract.balanceOf(signer.address);

  console.log(`🎟 NFT Ticket Balance: ${balance}`);
}

main().catch((error) => {
  console.error("❌ Error checking NFT balance:", error);
  process.exit(1);
});
