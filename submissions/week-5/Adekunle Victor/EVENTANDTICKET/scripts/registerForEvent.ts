import { ethers } from "hardhat";

async function main() {
  const [signer] = await ethers.getSigners(); // ✅ Correct way to get signer in Hardhat
  console.log(`Using account: ${signer.address}`);

  const eventContractAddress = "0x036c1B9f90861110F04c6728C73C5755B68356B2"; // Replace with actual contract address
  const eventId = 1; // Change as needed

  const EventContract = await ethers.getContractFactory("EventContract");
  const eventContract = EventContract.attach(eventContractAddress);

  try {
    const eventDetails = await eventContract.events(eventId);

    console.log("📌 Event Details:", {
      title: eventDetails.title,
      description: eventDetails.description,
      startDate: eventDetails.startDate.toString(),
      endDate: eventDetails.endDate.toString(),
      eventType: eventDetails.eventType.toString(),
      expectedGuestCount: eventDetails.expectedGuestCount.toString(),
      registeredGuestCount: eventDetails.registeredGuestCount.toString(),
      verifiedGuestCount: eventDetails.verifiedGuestCount.toString(),
      organizer: eventDetails.organizer,
      ticketAddress: eventDetails.ticketAddress,
    });

    // ✅ FIX: Check for missing ticket contract
    if (!eventDetails.ticketAddress || eventDetails.ticketAddress === ethers.constants.AddressZero) {
      console.error("⛔ No ticket contract deployed for this event.");
      return;
    }

    const TicketNFT = await ethers.getContractFactory("TicketNFT");
    const ticketContract = TicketNFT.attach(eventDetails.ticketAddress);

    const ticketPrice = await ticketContract.ticketPrice();
    console.log(`🎟️ Ticket Price (ETH): ${ethers.utils.formatEther(ticketPrice)}`);

    const tx = await eventContract.connect(signer).registerForEvent(eventId, {
      value: ticketPrice,
    });

    await tx.wait();
    console.log("🎉 Successfully registered for the event!");
  } catch (error) {
    console.error("⚠️ Error during event registration:", error);
  }
}

main().catch((error) => {
  console.error("Script failed:", error);
  process.exit(1);
});
