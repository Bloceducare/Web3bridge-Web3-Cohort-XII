// File: scripts/deployNewEvent.ts

import { ethers } from "hardhat";
import { Contract, Interface } from "ethers";

// Import the contract artifacts and interfaces
import { NewEvent } from "../typechain-types/contracts/NewEvent";
import { Tickets } from "../typechain-types/contracts/erc721.sol/Tickets";

async function main() {
  console.log("Deploying the NewEvent contract...");
  
  // Deploy the NewEvent contract
  const NewEventFactory = await ethers.getContractFactory("NewEvent");
  const newEvent = await NewEventFactory.deploy() as unknown as NewEvent;
  
  // Wait for deployment to complete
  await newEvent.waitForDeployment();
  const newEventAddress = await newEvent.getAddress();
  
  console.log("NewEvent contract deployed to:", newEventAddress);
  
  // Get signers for testing
  const [organizer, attendee1, attendee2] = await ethers.getSigners();
  console.log("Organizer:", organizer.address);
  console.log("Attendee 1:", attendee1.address);
  console.log("Attendee 2:", attendee2.address);
  
  // Create a new event
  console.log("\nCreating a new paid event...");
  
  // Define event parameters
  const eventTitle = "Web3 Conference 2025";
  const eventDesc = "A conference for blockchain enthusiasts";
  const currentTime = Math.floor(Date.now() / 1000);
  const eventDate = currentTime + 3600 * 24 * 7; // One week from now
  const eventEndDate = eventDate + 3600 * 8; // 8 hours duration
  const eventType = 0; // 0 = paid event, 1 = free event
  const expectedAttendeeCount = 100;
  const ticketPrice = ethers.parseEther("0.1"); // 0.1 ETH
  
  // Create event transaction
  const createTx = await newEvent.organizerCreateEvent(
    eventTitle,
    eventDesc,
    eventDate,
    eventEndDate,
    eventType,
    expectedAttendeeCount,
    ticketPrice
  );
  await createTx.wait();
  console.log("Event created successfully!");
  
  // Get event counter
  const eventCounter = await newEvent.eventCounter();
  console.log("Current event counter:", eventCounter.toString());
  
  // Get event details
  const eventInfo = await newEvent.events(eventCounter);
  console.log("\nEvent details:");
  console.log("Title:", eventInfo.eventTitle);
  console.log("Organizer:", eventInfo.organizer);
  console.log("Start date:", new Date(Number(eventInfo.eventDate) * 1000).toLocaleString());
  console.log("End date:", new Date(Number(eventInfo.eventEndDate) * 1000).toLocaleString());
  // console.log("Event type:", eventInfo.eventTypes == 0 ? "Paid" : "Free");
  console.log("Ticket price:", ethers.formatEther(eventInfo.ticketPrice), "ETH");
  
  // Generate tickets for the event
  console.log("\nGenerating tickets for the event...");
  const ticketName = "Web3ConferenceTicket";
  const ticketSymbol = "W3CT";
  const generateTicketsTx = await newEvent.generateEventTicket(eventCounter, ticketName, ticketSymbol);
  await generateTicketsTx.wait();
  
  // Get updated event details with ticket address
  const updatedEventInfo = await newEvent.events(eventCounter);
  console.log("Ticket contract deployed at:", updatedEventInfo.ticketAddress);
  
  // Attendee 1 purchases a ticket
  console.log("\nAttendee 1 purchasing a ticket...");
  const purchaseTx = await newEvent.connect(attendee1).purchaseTicket(eventCounter, {
    value: ticketPrice
  });
  await purchaseTx.wait();
  
  // Get ticket contract
  const TicketsFactory = await ethers.getContractFactory("Tickets");
  const ticketContract = await TicketsFactory.attach(updatedEventInfo.ticketAddress) as unknown as Tickets;
  
  // Check if attendee 1 owns a ticket
  const ticketBalance = await ticketContract.balanceOf(attendee1.address);
  console.log("Attendee 1 ticket balance:", ticketBalance.toString());
  
  if (Number(ticketBalance) > 0) {
    console.log("Attendee 1 successfully purchased a ticket!");
  }
  
  // Register attendee 2 for the event
  console.log("\nAttendee 2 registering for the event...");
  const registerTx = await newEvent.connect(attendee2).registerForEvent(eventCounter);
  await registerTx.wait();
  
  // Verify if attendee 2 is registered
  const isRegistered = await newEvent.isRegistered(attendee2.address, eventCounter);
  console.log("Attendee 2 registration status:", isRegistered);
  
  // Get updated registered attendee count
  const updatedEventDetails = await newEvent.events(eventCounter);
  console.log("Registered attendee count:", updatedEventDetails.registeredAttendeeCount.toString());
  
  // Organizer verifies attendee 1
  console.log("\nOrganizer verifying attendee 1...");
  const verifyTx = await newEvent.verifyAttendee(eventCounter, attendee1.address);
  await verifyTx.wait();
  
  // Get final event state
  const finalEventDetails = await newEvent.events(eventCounter);
  console.log("\nFinal event status:");
  console.log("Registered attendees:", finalEventDetails.registeredAttendeeCount.toString());
  console.log("Verified attendees:", finalEventDetails.verifiedAttendeeCount.toString());
  
  console.log("\nDeployment and interaction completed successfully!");
}

// Execute the main function
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });