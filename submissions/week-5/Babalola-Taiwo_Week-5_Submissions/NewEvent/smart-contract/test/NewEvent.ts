// File: test/NewEvent.ts

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

// Import the specific contract types
import { NewEvent } from "../typechain-types/contracts/NewEvent";
import { Tickets } from "../typechain-types/contracts/erc721.sol/Tickets";

describe("NewEvent Contract", function () {
  // Declare variables used across tests
  let NewEventFactory: any;
  let newEvent: NewEvent;
  let TicketsFactory: any;
  let organizer: HardhatEthersSigner;
  let attendee1: HardhatEthersSigner;
  let attendee2: HardhatEthersSigner;
  let eventId: bigint;
  
  // Constants for event creation
  const eventTitle = "Web3 Conference 2025";
  const eventDesc = "A conference for blockchain enthusiasts";
  const currentTime = Math.floor(Date.now() / 1000);
  const eventDate = currentTime + 3600 * 24 * 7; // One week from now
  const eventEndDate = eventDate + 3600 * 8; // 8 hours duration
  const eventType = 0; // 0 = paid event
  const freeEventType = 1; // 1 = free event
  const expectedAttendeeCount = 100;
  const ticketPrice = ethers.parseEther("0.1"); // 0.1 ETH
  
  before(async function () {
    // Get signers
    [organizer, attendee1, attendee2] = await ethers.getSigners();
    
    // Deploy NewEvent contract
    NewEventFactory = await ethers.getContractFactory("NewEvent");
    newEvent = await NewEventFactory.deploy() as unknown as NewEvent;
    await newEvent.waitForDeployment();
    
    // Get Tickets contract factory for later use
    TicketsFactory = await ethers.getContractFactory("Tickets");
  });
  
  describe("Event Creation", function () {
    it("Should create a new paid event", async function () {
      const tx = await newEvent.organizerCreateEvent(
        eventTitle,
        eventDesc,
        eventDate,
        eventEndDate,
        eventType,
        expectedAttendeeCount,
        ticketPrice
      );
      await tx.wait();
      
      eventId = await newEvent.eventCounter();
      expect(eventId).to.equal(1n);
      
      const eventInfo = await newEvent.events(eventId);
      expect(eventInfo.eventTitle).to.equal(eventTitle);
      expect(eventInfo.organizer).to.equal(organizer.address);
      expect(eventInfo.eventTypes).to.equal(eventType);
      expect(eventInfo.ticketPrice).to.equal(ticketPrice);
    });
    
    it("Should create a new free event", async function () {
      const tx = await newEvent.organizerCreateEvent(
        "Free Web3 Workshop",
        "A free workshop for beginners",
        eventDate,
        eventEndDate,
        freeEventType,
        50, // smaller expected count
        0 // zero price for free event
      );
      await tx.wait();
      
      const newEventId = await newEvent.eventCounter();
      expect(newEventId).to.equal(2n);
      
      const eventInfo = await newEvent.events(newEventId);
      expect(eventInfo.eventTypes).to.equal(freeEventType);
      expect(eventInfo.ticketPrice).to.equal(0);
    });
    
    it("Should reject events with invalid dates", async function () {
      // Past event date
      await expect(
        newEvent.organizerCreateEvent(
          "Past Event",
          "Event in the past",
          currentTime - 3600, // 1 hour ago
          currentTime + 3600,
          eventType,
          100,
          ticketPrice
        )
      ).to.be.revertedWith("EVENT DATE SHOULD BE IN FUTURE");
      
      // End date before start date
      await expect(
        newEvent.organizerCreateEvent(
          "Invalid Event",
          "Event with invalid dates",
          eventDate,
          eventDate - 3600, // End before start
          eventType,
          100,
          ticketPrice
        )
      ).to.be.revertedWith("END DATE MUST BE AFTER START DATE");
    });
  });
  
  describe("Ticket Generation", function () {
    it("Should generate tickets for an event", async function () {
      const ticketName = "Web3ConferenceTicket";
      const ticketSymbol = "W3CT";
      
      // Generate ticket - note: if your contract doesn't emit an event, you can remove the expect emission check
      const tx = await newEvent.generateEventTicket(eventId, ticketName, ticketSymbol);
      await tx.wait();
      
      const eventInfo = await newEvent.events(eventId);
      expect(eventInfo.ticketAddress).to.not.equal(ethers.ZeroAddress);
      
      // Verify ticket contract
      const ticketContract = await TicketsFactory.attach(eventInfo.ticketAddress) as unknown as Tickets;
      expect(await ticketContract.name()).to.equal(ticketName);
      expect(await ticketContract.symbol()).to.equal(ticketSymbol);
    });
    
    it("Should reject ticket generation by non-organizers", async function () {
      await expect(
        newEvent.connect(attendee1).generateEventTicket(eventId, "Fake", "FAKE")
      ).to.be.revertedWith("ONLY ORGANIZER CAN CREATE TICKET");
    });
    
    it("Should reject generating tickets for non-existent events", async function () {
      const nonExistentId = 999;
      await expect(
        newEvent.generateEventTicket(nonExistentId, "Invalid", "INV")
      ).to.be.revertedWith("EVENT DOES NOT EXIST");
    });
  });
  
  describe("Event Registration", function () {
    it("Should allow registration for a free event", async function () {
      const freeEventId = 2n; // The free event we created earlier
      
      await expect(
        newEvent.connect(attendee1).registerForEvent(freeEventId)
      ).to.not.be.reverted;
      
      const isRegistered = await newEvent.isRegistered(attendee1.address, freeEventId);
      expect(isRegistered).to.be.true;
      
      const eventInfo = await newEvent.events(freeEventId);
      expect(eventInfo.registeredAttendeeCount).to.equal(1n);
    });
    
    it("Should reject double registration", async function () {
      const freeEventId = 2n;
      
      await expect(
        newEvent.connect(attendee1).registerForEvent(freeEventId)
      ).to.be.revertedWith("YOU'RE ALREADY REGISTERED");
    });
    
    it("Should reject registration for non-existent events", async function () {
      const nonExistentId = 999;
      
      await expect(
        newEvent.connect(attendee1).registerForEvent(nonExistentId)
      ).to.be.revertedWith("EVENT DOESNT EXIST");
    });
  });
  
  describe("Ticket Purchase", function () {
    it("Should allow purchasing a ticket for a paid event", async function () {
      await expect(
        newEvent.connect(attendee2).purchaseTicket(eventId, { value: ticketPrice })
      ).to.not.be.reverted;
      
      // Check if registered - the purchaseTicket function should register the attendee
      const isRegistered = await newEvent.isRegistered(attendee2.address, eventId);
      expect(isRegistered).to.be.true;
      
      // Check if ticket minted
      const eventInfo = await newEvent.events(eventId);
      const ticketContract = await TicketsFactory.attach(eventInfo.ticketAddress) as unknown as Tickets;
      expect(await ticketContract.balanceOf(attendee2.address)).to.equal(1n);
    });
    
    it("Should reject purchase with incorrect price", async function () {
      const incorrectPrice = ethers.parseEther("0.05"); // Half price
      
      await expect(
        newEvent.connect(attendee1).purchaseTicket(eventId, { value: incorrectPrice })
      ).to.be.revertedWith("INCORRECT TICKET PRICE");
    });
    
    it("Should reject purchase for free events", async function () {
      const freeEventId = 2n;
      
      await expect(
        newEvent.connect(attendee1).purchaseTicket(freeEventId, { value: ticketPrice })
      ).to.be.revertedWith("THIS EVENT IS FREE");
    });
  });
  
  describe("Attendee Verification", function () {
    it("Should allow organizer to verify attendees", async function () {
      await expect(
        newEvent.verifyAttendee(eventId, attendee2.address)
      ).to.not.be.reverted;
      
      const eventInfo = await newEvent.events(eventId);
      expect(eventInfo.verifiedAttendeeCount).to.equal(1n);
    });
    
    it("Should reject verification by non-organizers", async function () {
      await expect(
        newEvent.connect(attendee1).verifyAttendee(eventId, attendee2.address)
      ).to.be.revertedWith("ONLY ORGANIZER CAN VERIFY ATTENDEES");
    });
    
    it("Should reject verification of unregistered attendees", async function () {
      const unregisteredAddress = "0x0000000000000000000000000000000000000001";
      
      await expect(
        newEvent.verifyAttendee(eventId, unregisteredAddress)
      ).to.be.revertedWith("ATTENDEE IS NOT REGISTERED");
    });
  });
});