import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("EventContract", function () {
  async function deployEventContractFixture() {
    const [owner, user1] = await hre.ethers.getSigners();
    const EventContract = await hre.ethers.getContractFactory("EventContract");
    const deployedEventContract = await EventContract.deploy();

    return { deployedEventContract, owner, user1 };
  }

  // describe("Deployment", function () {
  //   it("should be deployed successfully", async () => {
  //     const { deployedEventContract: eventContract, owner } = await loadFixture(deployEventContractFixture);
  //     expect(eventContract.deploymentTransaction().contractAddress).to.not.equal("0x0");
  //     expect(eventContract.deploymentTransaction().contractAddress).to.not.equal(undefined);
  //   });
  // });

  describe("Event Creation", function () {
    it("should allow an organizer to create an event", async function () {
      const { deployedEventContract, owner } = await loadFixture(deployEventContractFixture);
      const eventTitle = "Tech Conference";
      const eventDesc = "A tech event for developers";
      const startDate = Math.floor(Date.now() / 1000) + 1000; // 1 minute from now
      const endDate = startDate + 3600; // 1 hour after start
      const eventType = 1; // PAID event
      const expectedGuests = 100;

      await expect(deployedEventContract.createEvent(eventTitle, eventDesc, startDate, endDate, eventType, expectedGuests))
        .to.emit(deployedEventContract, "EventCreated")
        .withArgs(1, owner.address);
    });

    it("should reject event creation if the start date is in the past", async function () {
      const { deployedEventContract } = await loadFixture(deployEventContractFixture);
      const eventTitle = "Old Event";
      const eventDesc = "This event is in the past";
      const startDate = Math.floor(Date.now() / 1000) - 1000; // 1 minute in the past
      const endDate = startDate + 3600;

      await expect(deployedEventContract.createEvent(eventTitle, eventDesc, startDate, endDate, 0, 100))
        .to.be.revertedWith("Start date must be in the future");
    });

    it("should reject event creation if end date is before start date", async function () {
      const { deployedEventContract } = await loadFixture(deployEventContractFixture);
      const eventTitle = "Invalid Event";
      const eventDesc = "Start and end date mismatch";
      const startDate = Math.floor(Date.now() / 1000) + 1000; // 1 minute from now
      const endDate = startDate - 3600; // 1 hour before start

      await expect(deployedEventContract.createEvent(eventTitle, eventDesc, startDate, endDate, 0, 100))
        .to.be.revertedWith("End date must be after start date");
    });
  });

  describe("User Registration", function () {
    it("should allow a user to register for an event", async function () {
      const { deployedEventContract, owner, user1 } = await loadFixture(deployEventContractFixture);
      const eventTitle = "Tech Conference";
      const eventDesc = "A tech event for developers";
      const startDate = Math.floor(Date.now() / 1000) + 1000; // 1 minute from now
      const endDate = startDate + 3600; // 1 hour after start
      const eventType = 1; // PAID event
      const expectedGuests = 100;

      await deployedEventContract.createEvent(eventTitle, eventDesc, startDate, endDate, eventType, expectedGuests);

      await expect(deployedEventContract.connect(user1).registerForEvent(1))
        .to.emit(deployedEventContract, "UserRegistered")
        .withArgs(1, user1.address);
    });

    // it("should reject registration after event has ended", async function () {
    //   const { eventContract, owner, account1 } = await loadFixture(deployEventFixture);
    //   const startDate = Math.floor(Date.now() / 1000) + 60; // 1 minute from now
    //   const endDate = startDate + 3600; // 1 hour after the start
    //   const eventId = await eventContract.createEvent("Test Event", "Description", startDate, endDate, EventType.PAID, 10);

    //   // Wait until the event has ended before trying to register
    //   await network.provider.send("evm_increaseTime", [endDate - startDate + 1]);
    //   await network.provider.send("evm_mine");

    //   await expect(eventContract.registerForEvent(eventId)).to.be.revertedWith("Event has ended");
    // });

  //   it("should reject multiple registrations for the same event", async function () {
  //     const { deployedEventContract, user1 } = await loadFixture(deployEventContractFixture);
  //     const eventTitle = "Exclusive Event";
  //     const eventDesc = "You can only register once";
  //     const startDate = Math.floor(Date.now() / 1000) + 1000; // 1 minute from now
  //     const endDate = startDate + 3600;

  //     await deployedEventContract.createEvent(eventTitle, eventDesc, startDate, endDate, 0, 100);

  //     await deployedEventContract.connect(user1).registerForEvent(1);

  //     await expect(deployedEventContract.connect(user1).registerForEvent(1))
  //       .to.be.revertedWith("Already registered");
  //   });
  // });

  // describe("Ticket Creation", function () {
  //   it("should allow the organizer to create a ticket for the event", async function () {
  //     const { eventContract, owner } = await loadFixture(deployEventFixture);
  //     const startDate = Math.floor(Date.now() / 1000) + 60;
  //     const endDate = startDate + 3600;
  //     const eventId = await eventContract.createEvent("Test Event", "Description", startDate, endDate, EventType.PAID, 10);

  //     await expect(eventContract.createEventTicket(eventId, "Ticket", "TKT"))
  //       .to.emit(eventContract, "EventCreated")
  //       .withArgs(eventId, owner.address);
  //   });

    it("should prevent non-organizers from creating tickets", async function () {
      const { deployedEventContract, owner, user1 } = await loadFixture(deployEventContractFixture);
      const eventTitle = "Unauthorized Ticket";
      const eventDesc = "Only organizers can create tickets";
      const startDate = Math.floor(Date.now() / 1000) + 1000; // 1 minute from now
      const endDate = startDate + 3600;
      const expectedGuests = 100;

      await deployedEventContract.createEvent(eventTitle, eventDesc, startDate, endDate, 0, expectedGuests);

      await expect(deployedEventContract.connect(user1).createEventTicket(1, "FakeTicket", "FTK"))
        .to.be.revertedWith("Only organizer can create ticket");
    });
  });

  // describe("Ticket Verification", function () {
  //   it("should allow verification of a valid ticket", async function () {
  //     const { eventContract, account1, eventId } = await loadFixture(deployEventFixture);
  //     await eventContract.registerForEvent(eventId);
  //     const ticketId = await eventContract.createTicket(eventId);

  //     await expect(eventContract.verifyTicket(eventId, ticketId))
  //       .to.emit(eventContract, "TicketVerified")
  //       .withArgs(eventId, account1.address);
  //   });

  //   it("should reject invalid tickets", async function () {
  //     const { eventContract, account1, eventId } = await loadFixture(deployEventFixture);
  //     const invalidTicketId = 999; // Invalid ticket id

  //     await expect(eventContract.verifyTicket(eventId, invalidTicketId))
  //       .to.be.revertedWith("Invalid ticket");
  //   });
  // });
});
