const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EVENT", async () => {
  async function deployEvent() {
    const [owner, otherAccount] = await ethers.getSigners();

    const Event = await ethers.getContractFactory("Event");
    const event = await Event.deploy();

    return { event, owner, otherAccount };
  }

  describe("createEventTicket", function () {
    it("should allow the organizer to create a ticket for the event", async function () {
      const { event, owner } = await loadFixture(deployEvent);

      // Create an event first
      const title = "Sample Event";
      const description = "This is a sample event.";
       // Start in the future
      const startDate = (await time.latest()) + 1000;
      const endDate = startDate + 10000; 
      const eventType = 1; // 'paid'
      const expectedGuestCount = 100;
      const tokenURI = "https://ticket.com/jjj";
      const amount = ethers.parseEther("1");

      await event.createEvent(
        title,
        description,
        startDate,
        endDate,
        eventType,
        expectedGuestCount,
        tokenURI,
        amount
      );

      // Create a ticket for the event
      const ticketName = "Sample Ticket";
      const ticketSymbol = "STK";

      const address = 0x0000000000000000000000000000000000000000;

      await expect(event.createEventTicket(1, ticketName, ticketSymbol))
        .to.emit(event, "TicketCreated")
        .withArgs(1, anyValue);

      const eventDetails = await event.events(1);
      expect(eventDetails.ticketAddress).to.not.equal(address);
    });

    it("should revert if a non-organizer tries to create a ticket", async function () {
      const { event, otherAccount } = await loadFixture(deployEvent);

      // Create an event first
      const title = "Sample Event";
      const description = "This is a sample event.";
      const startDate = (await time.latest()) + 1000;
      const endDate = startDate + 10000;
      const eventType = 1;
      const expectedGuestCount = 100;
      const tokenURI = "https://ticket.com/jjj";
      const amount = ethers.parseEther("1");

      await event.createEvent(
        title,
        description,
        startDate,
        endDate,
        eventType,
        expectedGuestCount,
        tokenURI,
        amount
      );

      // Attempt to create a ticket as a non-organizer
      const ticketName = "Sample Ticket";
      const ticketSymbol = "STK";

      await expect(
        event
          .connect(otherAccount)
          .createEventTicket(1, ticketName, ticketSymbol)
      ).to.be.revertedWith("ONLY ORGANIZER CAN CREATE"); // Check for the revert message
    });
  });

  describe("registerForEvent", function () {
    it("should allow a user to register for an event", async function () {
      const { event, owner, otherAccount } = await loadFixture(deployEvent);

      // Create an event first
      const title = "Event";
      const description = "This is a sample event.";
      const startDate = (await time.latest()) + 1000; // Start in the future
      const endDate = startDate + 10000;
      const eventType = 1; // paid event
      const expectedGuestCount = 100;
      const tokenURI = "https://ticket.com/jjj";
      const amount = ethers.parseEther("1");

      await event.createEvent(
        title,
        description,
        startDate,
        endDate,
        eventType,
        expectedGuestCount,
        tokenURI,
        amount
      );

      // Register for the event
      expect(await event.connect(otherAccount).registerForEvent(1));

      const hasRegistered = await event.hasRegistered(otherAccount.address, 1);
      await expect(hasRegistered).to.be.true;
    });

    it("should revert if the event has ended", async function () {
      const { event, owner, otherAccount } = await loadFixture(deployEvent);

      // Create an event first
      const title = "Event";
      const description = "This is a sample test event.";
      // Start in the future
      const startDate = (await time.latest()) + 1000; 
      // End after 10 seconds
      const endDate = startDate + 10000; 
      const amount = ethers.parseEther("1");
      await event.createEvent(
        title,
        description,
        startDate,
        endDate,
        1, //  'paid'
        100,
        "https://example.com/jjj",
        amount
      );

      //  increase time to after the event has ended
      await time.increase(11000);

      await expect(
        event.connect(otherAccount).registerForEvent(1)
      ).to.be.revertedWith("EVENT HAS ENDED");
    });

    it("should revert if the user has already registered", async function () {
      const { event, owner, otherAccount } = await loadFixture(deployEvent);

      // Create an event first
      const title = "Event";
      const description = "This is a sample event.";
      // start in the future
      const startDate = (await time.latest()) + 1000;
      const endDate = startDate + 10000;
      const amount = ethers.parseEther("1");

      await event.createEvent(
        title,
        description,
        startDate,
        endDate,
        1,
        100,
        "https://ticket.com/jjj", amount
      );

      // Register for the event
      await event.connect(otherAccount).registerForEvent(1);

      await expect(
        event.connect(otherAccount).registerForEvent(1)
      ).to.be.revertedWith("ALREADY REGISTERED");
    });
  });
  describe("createEventTicket", function () {
    it("should allow the organizer to create a ticket for the event", async function () {
        const { event, owner } = await loadFixture(deployEvent);

        // Create an event first
        const title = "Sample Event";
        const description = "This is a sample event.";
        const startDate = (await time.latest()) + 1000; // Start in the future
        const endDate = startDate + 10000; // End after 10 seconds
        const eventType = 1; // Assuming 1 corresponds to 'paid'
        const expectedGuestCount = 100;
        const tokenURI = "https://ticket.com/jjj";
        const amount = ethers.parseEther("1");

        await event.createEvent(
            title,
            description,
            startDate,
            endDate,
            eventType,
            expectedGuestCount,
            tokenURI,
            amount
        );

        // Create a ticket for the event
        const ticketName = "Ticket";
        const ticketSymbol = "ETK";

        await expect(event.createEventTicket(1, ticketName, ticketSymbol))
            .to.emit(event, "TicketCreated")
            .withArgs(1, anyValue); 
            
        const addressZero = 0x0000000000000000000000000000000000000000;


        const eventDetails = await event.events(1);
        expect(eventDetails.ticketAddress).to.not.equal(addressZero); 
    });

    it("should revert if a non-organizer tries to create a ticket", async function () {
        const { event, otherAccount } = await loadFixture(deployEvent);

        // Create an event first
        const title = "Sample Event";
        const description = "This is a sample event.";
         // Start in the future
        const startDate = (await time.latest()) + 1000;
        // End after 10 seconds
        const endDate = startDate + 10000; 
        const eventType = 1; // 'paid'
        const expectedGuestCount = 100;
        const tokenURI = "https://ticket.com/jjj";
        const amount = ethers.parseEther("1");

        await event.createEvent(
            title,
            description,
            startDate,
            endDate,
            eventType,
            expectedGuestCount,
            tokenURI,
            amount
        );

        // Attempt to create a ticket as a non-organizer
        const ticketName = "Ticket";
        const ticketSymbol = "ETK";

        await expect(
            event.connect(otherAccount).createEventTicket(1, ticketName, ticketSymbol)
        ).to.be.revertedWith("ONLY ORGANIZER CAN CREATE"); 
    });

    it("should revert if the ticket has already been created", async function () {
        const { event, owner } = await loadFixture(deployEvent);

        // Create an event first
        const title = "Event";
        const description = "This is a sample test event.";
        const startDate = (await time.latest()) + 1000;  
        const endDate = startDate + 10000; 
        const eventType = 1; 
        const expectedGuestCount = 100;
        const tokenURI = "https://ticket.com/jjj";
        const amount = ethers.parseEther("1");

        await event.createEvent(
            title,
            description,
            startDate,
            endDate,
            eventType,
            expectedGuestCount,
            tokenURI,
            amount
        );

        // Create a ticket for the event
        const ticketName = "Ticket";
        const ticketSymbol = "ETK";

        await event.createEventTicket(1, ticketName, ticketSymbol); 

        await expect(
            event.createEventTicket(1, ticketName, ticketSymbol)
        ).to.be.revertedWith("TICKET ALREADY CREATED"); 
    });
});

describe("confirmAttendance", function () {
    it("should allow a registered user to confirm attendance for an event", async function () {
        const { event, owner, otherAccount } = await loadFixture(deployEvent);

        const title = "Sample Event";
        const description = "This is a sample event.";
        const startDate = (await time.latest()) + 1000;
        const endDate = startDate + 10000;
        const eventType = 1;
        const expectedGuestCount = 100;
        const tokenURI = "https://ticket.com/jjj";
        const amount = ethers.parseEther("1");

        await event.createEvent(
            title,
            description,
            startDate,
            endDate,
            eventType,
            expectedGuestCount,
            tokenURI,
            amount
        );

        await event.connect(otherAccount).registerForEvent(1);

        await expect(event.connect(otherAccount).confirmAttendance(1))
            .to.emit(event, "AttendanceConfirmed")
            .withArgs(1, otherAccount.address);

        const eventDetails = await event.events(1);
        expect( await eventDetails._verifiedGuestCount).to.equal(1);
    });

    it("should revert if the user is not registered for the event", async function () {
        const { event, otherAccount } = await loadFixture(deployEvent);

        const title = "Sample Event";
        const description = "This is a sample event.";
        const startDate = (await time.latest()) + 1000;
        const endDate = startDate + 10000;
        const eventType = 1;
        const expectedGuestCount = 100;
        const tokenURI = "https://ticket.com/jjj";
        const amount = ethers.parseEther("1");

        await event.createEvent(
            title,
            description,
            startDate,
            endDate,
            eventType,
            expectedGuestCount,
            tokenURI,
            amount
        );

        await expect(event.connect(otherAccount).confirmAttendance(1))
            .to.be.revertedWith("NOT REGISTERED");
    });

    it("should revert if the event does not exist", async function () {
        const { event, otherAccount } = await loadFixture(deployEvent);

        await expect(event.connect(otherAccount).confirmAttendance(999))
            .to.be.revertedWith("EVENT DOESNT EXIST");
    });
});
    
describe("purchaseTicket", function () {
    it("should allow a user to purchase a ticket for a paid event", async function () {
        const { event, owner, otherAccount } = await loadFixture(deployEvent);

        const title = "Sample Event";
        const description = "This is a sample event.";
        const startDate = (await time.latest()) + 1000;
        const endDate = startDate + 10000;
        const eventType = 1;
        const expectedGuestCount = 100;
        const tokenURI = "https://ticket.com/jjj";
        const amount = ethers.parseEther("1");

        await event.createEvent(
            title,
            description,
            startDate,
            endDate,
            eventType,
            expectedGuestCount,
            tokenURI,
            ethers.parseEther("1")
        );

        await expect(event.connect(otherAccount).purchaseTicket(1, { value: ethers.parseEther("1") }))
            .to.emit(event, "TicketPurchased")
            .withArgs(1, otherAccount.address);

        // const eventDetails = await event.events(1);
        // expect(eventDetails.paymentStatus).to.be.true;
    });

    it("should revert if the event does not exist", async function () {
        const { event, otherAccount } = await loadFixture(deployEvent);

        await expect(event.connect(otherAccount).purchaseTicket(999, { value: ethers.parseEther("0.1") }))
            .to.be.revertedWith("EVENT DOESNT EXIST");
    });

    it("should revert if the event is not a paid event", async function () {
        const { event, owner, otherAccount } = await loadFixture(deployEvent);

        const title = "Free Event";
        const description = "This is a free event.";
        const startDate = (await time.latest()) + 1000;
        const endDate = startDate + 10000;
        const eventType = 0;
        const expectedGuestCount = 100;
        const tokenURI = "https://ticket.com/jjj";
        const amount = ethers.parseEther("1");

        await event.createEvent(
            title,
            description,
            startDate,
            endDate,
            eventType,
            expectedGuestCount,
            tokenURI,
            amount
        );

        await expect(event.connect(otherAccount).purchaseTicket(1, { value: ethers.parseEther("0.1") }))
            .to.be.revertedWith("EVENT IS NOT PAID");
    });

    it("should revert if the payment amount is incorrect", async function () {
        const { event, owner, otherAccount } = await loadFixture(deployEvent);

        const title = "Sample Event";
        const description = "This is a sample event.";
        const startDate = (await time.latest()) + 1000;
        const endDate = startDate + 10000;
        const eventType = 1;
        const expectedGuestCount = 100;
        const tokenURI = "https://ticket.com/jjj";
        const amount = ethers.parseEther("1");

        await event.createEvent(
            title,
            description,
            startDate,
            endDate,
            eventType,
            expectedGuestCount,
            tokenURI,
            amount
        );


        await expect(event.connect(otherAccount).purchaseTicket(1, { value: ethers.parseEther("0.05") }))
            .to.be.revertedWith("INCORRECT PAYMENT AMOUNT");
    });
});
});
