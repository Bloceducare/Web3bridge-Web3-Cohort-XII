import { time, loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("EventFactory", function () {
  async function deployEventFactoryFixture() {
    const [owner, organizer, guest] = await hre.ethers.getSigners();

    const EventFactory = await hre.ethers.getContractFactory("EventFactory");
    const eventFactory = await EventFactory.deploy();

    return { eventFactory, owner, organizer, guest };
  }

  describe("Deployment", function () {
    it("Should deploy the contract", async function () {
      const { eventFactory } = await loadFixture(deployEventFactoryFixture);
      expect(eventFactory.target).to.be.properAddress;
    });
  });

  describe("Create Event", function () {
    it("Should create a new event", async function () {
      const { eventFactory, organizer } = await loadFixture(deployEventFactoryFixture);

      const title = "Web3 Conference";
      const description = "A conference on blockchain technology";
      const startDate = (await time.latest()) + 1000; // 1000 seconds in the future
      const endDate = startDate + 2000; // 2000 seconds after start
      const eventType = 1; 
      const expectedGuestCount = 1000;
      const ticketName = "Web3Ticket";
      const ticketSymbol = "W3T";

      await expect(
        eventFactory.connect(organizer).createEvent(
          title,
          description,
          startDate,
          endDate,
          eventType,
          expectedGuestCount,
          ticketName,
          ticketSymbol
        )
      ).to.emit(eventFactory, "EventCreated");
    });

    it("Should fail if start date is in the past", async function () {
      const { eventFactory, organizer } = await loadFixture(deployEventFactoryFixture);

      const startDate = (await time.latest()) - 1000; 
      const endDate = startDate + 2000;

      await expect(
        eventFactory.connect(organizer).createEvent(
          "Invalid Event",
          "This should fail",
          startDate,
          endDate,
          0, // Free event
          100,
          "Ticket",
          "TKT"
        )
      ).to.be.revertedWith("Start date must be in the future");
    });
  });

  describe("Register for Event", function () {
    it("Should register for a free event", async function () {
      const { eventFactory, organizer, guest } = await loadFixture(deployEventFactoryFixture);

      const startDate = (await time.latest()) + 1000;
      const endDate = startDate + 2000;

      await eventFactory.connect(organizer).createEvent(
        "Free Event",
        "Free event description",
        startDate,
        endDate,
        0, // Free event
        100,
        "FreeTicket",
        "FTK"
      );

      await expect(eventFactory.connect(guest).registerForEvent(1))
        .to.emit(eventFactory, "EventRegistered")
        .withArgs(1, guest.address);
    });

    it("Should register for a paid event", async function () {
      const { eventFactory, organizer, guest } = await loadFixture(deployEventFactoryFixture);

      const startDate = (await time.latest()) + 1000;
      const endDate = startDate + 2000;

      await eventFactory.connect(organizer).createEvent(
        "Paid Event",
        "Paid event description",
        startDate,
        endDate,
        1, // Paid event
        100,
        "PaidTicket",
        "PTK"
      );

      await expect(
        eventFactory.connect(guest).registerForEvent(1, { value: hre.ethers.parseEther("0.1") })
      )
        .to.emit(eventFactory, "EventRegistered")
        .withArgs(1, guest.address);
    });
  });

  describe("Confirm Attendance", function () {
    it("Should confirm attendance", async function () {
      const { eventFactory, organizer, guest } = await loadFixture(deployEventFactoryFixture);

      const startDate = (await time.latest()) + 1000;
      const endDate = startDate + 2000;

      await eventFactory.connect(organizer).createEvent(
        "Test Event",
        "Test event description",
        startDate,
        endDate,
        0, // Free event
        100,
        "TestTicket",
        "TTK"
      );

      await eventFactory.connect(guest).registerForEvent(1);
      await time.increaseTo(endDate + 1);

      await expect(eventFactory.connect(organizer).confirmAttendance(1, guest.address))
        .to.not.be.reverted;
    });
  });
});