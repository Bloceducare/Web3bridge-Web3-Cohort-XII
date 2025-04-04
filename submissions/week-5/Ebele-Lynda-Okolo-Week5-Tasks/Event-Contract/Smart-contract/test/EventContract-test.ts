import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { EventContract, TicketNFT } from "../typechain-types";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("EventContract", function () {
    let eventContract: EventContract;
    let owner: SignerWithAddress;
    let addr1: SignerWithAddress;
    let addr2: SignerWithAddress;
    let eventId: number;

    const EventType = {
        FREE: 0,
        PAID: 1
    };

    // Test event parameters
    const testEvent = {
        title: "Test Event",
        description: "Test Event Description",
        startDate: 0, // Will be set in beforeEach
        endDate: 0,   // Will be set in beforeEach
        expectedGuestCount: 100,
        eventType: EventType.FREE
    };

    beforeEach(async function () {
        // Get signers
        [owner, addr1, addr2] = await ethers.getSigners();

        // Deploy contract
        const EventContractFactory = await ethers.getContractFactory("EventContract");
        eventContract = await EventContractFactory.deploy();
        await eventContract.waitForDeployment();

        // Set event dates
        const currentTime = await time.latest();
        testEvent.startDate = currentTime + 86400; // Start tomorrow
        testEvent.endDate = currentTime + (86400 * 2); // End in 2 days
    });

    describe("Create Event", function () {
        it("Should create a free event successfully", async function () {
            const tx = await eventContract.createEvent(
                testEvent.title,
                testEvent.description,
                testEvent.startDate,
                testEvent.endDate,
                EventType.FREE,
                testEvent.expectedGuestCount
            );

            const receipt = await tx.wait();  // Wait for the transaction to be mined
            // const event = receipt?.contractAddress?.find(e => e.event === 'EventCreated');
            // expect(event).to.not.be.undefined;

            const createdEvent = await eventContract.events(1);
            expect(createdEvent.title).to.equal(testEvent.title);
            expect(createdEvent.description).to.equal(testEvent.description);
            expect(createdEvent.eventType).to.equal(EventType.FREE);
        });

        it("Should fail if start date is in the past", async function () {
            const pastDate = (await time.latest()) - 86400;
            
            await expect(
                eventContract.createEvent(
                    testEvent.title,
                    testEvent.description,
                    pastDate,
                    testEvent.endDate,
                    EventType.FREE,
                    testEvent.expectedGuestCount
                )
            ).to.be.revertedWith("START DATE MUST BE IN FUTURE");
        });
    });

    describe("Create Event Ticket", function () {
        beforeEach(async function () {
            const tx = await eventContract.createEvent(
                testEvent.title,
                testEvent.description,
                testEvent.startDate,
                testEvent.endDate,
                EventType.FREE,
                testEvent.expectedGuestCount
            );
            const receipt = await tx.wait();
            eventId = 1;
        });

        it("Should create ticket contract successfully", async function () {
            await eventContract.createEventTicket(eventId, "Test Ticket", "TT");
            
            const eventDetails = await eventContract.events(eventId);
            expect(eventDetails.ticketAddress).to.not.equal(ethers);
        });

        it("Should fail if not organizer", async function () {
            await expect(
                eventContract.connect(addr1).createEventTicket(eventId, "Test Ticket", "TT")
            ).to.be.revertedWith("ONLY ORGANIZER CAN CREATE");
        });
    });

    describe("Register For Event", function () {
        beforeEach(async function () {
            await eventContract.createEvent(
                testEvent.title,
                testEvent.description,
                testEvent.startDate,
                testEvent.endDate,
                EventType.FREE,
                testEvent.expectedGuestCount
            );
            eventId = 1;
        });

        it("Should register for free event successfully", async function () {
            await eventContract.connect(addr1).registerForEvent(eventId);
            
            const hasRegistered = await eventContract.hasRegistered(addr1.address, eventId);
            expect(hasRegistered).to.be.true;
            
            const eventDetails = await eventContract.events(eventId);
            expect(eventDetails.registeredGuestCount).to.equal(1);
        });

        it("Should fail if already registered", async function () {
            await eventContract.connect(addr1).registerForEvent(eventId);
            await expect(
                eventContract.connect(addr1).registerForEvent(eventId)
            ).to.be.revertedWith("ALREADY REGISTERED");
        });
    });

    describe("Purchase Ticket", function () {
        beforeEach(async function () {
            await eventContract.createEvent(
                testEvent.title,
                testEvent.description,
                testEvent.startDate,
                testEvent.endDate,
                EventType.PAID,
                testEvent.expectedGuestCount
            );
            eventId = 1;
            await eventContract.createEventTicket(eventId, "Test Ticket", "TT");
        });

        it("Should purchase ticket successfully", async function () {
            await eventContract.connect(addr1).purchaseTicket(eventId);
            
            const hasRegistered = await eventContract.hasRegistered(addr1.address, eventId);
            expect(hasRegistered).to.be.true;
            
            const eventDetails = await eventContract.events(eventId);
            expect(eventDetails.registeredGuestCount).to.equal(1);
        });

        it("Should fail if already purchased", async function () {
            await eventContract.connect(addr1).purchaseTicket(eventId);
            await expect(
                eventContract.connect(addr1).purchaseTicket(eventId)
            ).to.be.revertedWith("ALREADY PURCHASED");
        });
    });

    describe("Verify Attendance", function () {
        let ticketId: number;

        beforeEach(async function () {
            // Create event
            await eventContract.createEvent(
                testEvent.title,
                testEvent.description,
                testEvent.startDate,
                testEvent.endDate,
                EventType.FREE,
                testEvent.expectedGuestCount
            );
            eventId = 1;

            // Create ticket contract
            await eventContract.createEventTicket(eventId, "Test Ticket", "TT");

            // Purchase ticket
            await eventContract.connect(addr1).purchaseTicket(eventId);
            
            // Get ticket ID (assuming it's 1 as it's the first ticket)
            ticketId = 1;
        });

        it("Should verify attendance successfully", async function () {
            const eventDetails = await eventContract.events(eventId);
            const ticketContract = await ethers.getContractAt("TicketNFT", eventDetails.ticketAddress);
        
            const ticketId = 1 //await ticketContract.tokenOfOwnerByIndex(addr1.address, 0);
        
            await eventContract.verifyAttendance(eventId, ticketId);
        
            const isVerified = await eventContract.hasVerifiedAttendance(eventId, ticketId);
            expect(isVerified).to.be.true;
            
            const updatedEventDetails = await eventContract.events(eventId);
            expect(updatedEventDetails.verifiedGuestCount).to.equal(1);
        });
        

        it("Should fail if not organizer", async function () {
            await expect(
                eventContract.connect(addr1).verifyAttendance(eventId, ticketId)
            ).to.be.revertedWith("ONLY ORGANIZER CAN VERIFY");
        });

        it("Should fail if already verified", async function () {
            await eventContract.verifyAttendance(eventId, ticketId);
            await expect(
                eventContract.verifyAttendance(eventId, ticketId)
            ).to.be.revertedWith("ALREADY VERIFIED");
        });
    });
});