import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { EventContract, Tickets } from "../typechain-types";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("EventContract", function () {
  let eventContract: EventContract;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let eventId: number;

  const EventType = {
    FREE: 0,
    PAID: 1,
  };

  const testEvent = {
    title: "Test Event",
    description: "Test Event Description",
    startDate: 0,
    endDate: 0,
    expectedGuestCount: 100,
    ticketPrice: ethers.parseEther("1"),
  };

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const EventContractFactory = await ethers.getContractFactory(
      "EventContract"
    );
    eventContract = await EventContractFactory.deploy();
    await eventContract.waitForDeployment();

    const currentTime = await time.latest();
    testEvent.startDate = currentTime + 86400;
    testEvent.endDate = currentTime + 86400 * 2;
  });

  describe("Create Event", function () {
    it("Should create a free event successfully", async function () {
      await eventContract.createEvent(
        testEvent.title,
        testEvent.description,
        testEvent.startDate,
        testEvent.endDate,
        EventType.FREE,
        testEvent.expectedGuestCount,
        0
      );

      const createdEvent = await eventContract.events(1);
      expect(createdEvent._title).to.equal(testEvent.title);
    });

    it("Should fail if end date is before start date", async function () {
      await expect(
        eventContract.createEvent(
          testEvent.title,
          testEvent.description,
          testEvent.endDate, // Incorrect: End date before start date
          testEvent.startDate, // Swapped
          EventType.FREE,
          testEvent.expectedGuestCount,
          0
        )
      ).to.be.revertedWith("END DATE MUST BE GREATER");
    });
  });

  describe("Create Event Ticket", function () {
    beforeEach(async function () {
      await eventContract.createEvent(
        testEvent.title,
        testEvent.description,
        testEvent.startDate,
        testEvent.endDate,
        EventType.FREE,
        testEvent.expectedGuestCount,
        0
      );
      eventId = 1;
    });

    it("Should create a ticket contract successfully", async function () {
      await eventContract.createEventTicket(eventId, "Test Ticket", "TT");
      const eventDetails = await eventContract.events(eventId);
      expect(eventDetails._ticketAddress).to.not.equal(ethers.ZeroAddress);
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
        testEvent.expectedGuestCount,
        testEvent.ticketPrice
      );
      eventId = 1;
      await eventContract.createEventTicket(eventId, "Test Ticket", "TT");
    });

    it("Should allow users to purchase a ticket", async function () {
      await eventContract
        .connect(addr1)
        .purchaseTicket(eventId, { value: testEvent.ticketPrice });
      const hasRegistered = await eventContract.hasRegistered(
        addr1.address,
        eventId
      );
      expect(hasRegistered).to.be.true;
    });

    it("Should fail if insufficient funds are sent", async function () {
      await expect(
        eventContract.connect(addr1).purchaseTicket(eventId, {
          value: ethers.parseEther("0.5"), // Less than ticket price
        })
      ).to.be.revertedWith("INCORRECT TICKET PRICE");
    });

    it("Should prevent duplicate ticket purchases", async function () {
      await eventContract.connect(addr1).purchaseTicket(eventId, {
        value: testEvent.ticketPrice,
      });

      await expect(
        eventContract.connect(addr1).purchaseTicket(eventId, {
          value: testEvent.ticketPrice,
        })
      ).to.be.revertedWith("ALREADY REGISTERED");
    });
  });

  describe("Confirm Attendance", function () {
    beforeEach(async function () {
      await eventContract.createEvent(
        testEvent.title,
        testEvent.description,
        testEvent.startDate,
        testEvent.endDate,
        EventType.FREE,
        testEvent.expectedGuestCount,
        0
      );
      eventId = 1;
      await eventContract.createEventTicket(eventId, "Test Ticket", "TT");
      await eventContract.connect(addr1).purchaseTicket(eventId);
    });

    it("Should allow organizer to confirm attendance", async function () {
      await eventContract.confirmAttendance(eventId, addr1.address);
      const hasAttended = await eventContract.hasAttended(
        addr1.address,
        eventId
      );
      expect(hasAttended).to.be.true;
    });

    it("Should prevent non-organizers from confirming attendance", async function () {
      await expect(
        eventContract.connect(addr1).confirmAttendance(eventId, addr2.address)
      ).to.be.revertedWith("ONLY ORGANIZER CAN CONFIRM");
    });
  });
});
