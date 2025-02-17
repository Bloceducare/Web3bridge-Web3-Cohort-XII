import { ethers } from "hardhat";

async function main() {
  const eventContractAddress = "0x063Ac592F8cd80fa97c9D9B969C86afe611aB39B"; 
  const signer = (await ethers.getSigners())[0]; // Get the first signer (deployer)

  // Connect to the EventManagement contract
  const eventContract = await ethers.getContractAt("EventManagement", eventContractAddress, signer);

  const eventId = 2; // Replace with actual event ID

  console.log(`Fetching event details for ID: ${eventId}...`);
  const eventDetails = await eventContract.events(eventId);

  console.log("Registering for the event...");
  
  try {
    let tx;
    
    if (Number(eventDetails.eventType) === 1) {
      // Paid event: call purchaseTicket() and send ETH
      console.log(`This is a paid event. Sending ETH: ${ethers.formatEther("0.05")} ETH`);
      tx = await eventContract.purchaseTicket(eventId, {
        value: ethers.parseEther("0.05"),
      });
    } else {
      // Free event: call registerForEvent()
      tx = await eventContract.registerForEvent(eventId);
    }

    await tx.wait();
    console.log("Successfully registered/purchased ticket. Transaction:", tx);
  } catch (error) {
    console.error(" Registration failed:", error);
  }
}

main().catch((error) => {
  console.error("Script execution failed:", error);
  process.exitCode = 1;
});
