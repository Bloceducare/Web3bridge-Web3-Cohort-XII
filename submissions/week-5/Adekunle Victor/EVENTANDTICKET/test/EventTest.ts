const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EventContract", function () {
  let EventContract, eventContract;
  let TicketNFT, ticketNFT;
  let owner, attendee, nonOrganizer;
  
  beforeEach(async function () {
    [owner, attendee, nonOrganizer] = await ethers.getSigners();
    EventContract = await ethers.getContractFactory("EventContract");
    eventContract = await EventContract.deploy();
    await eventContract.waitForDeployment();
  });

  it("Should create an event", async function () {
    await expect(
      eventContract.createEvent(
        "Blockchain Conference",
        "A conference on blockchain tech",
        (await ethers.provider.getBlock("latest")).timestamp + 3600,
        (await ethers.provider.getBlock("latest")).timestamp + 7200,
        1,
        100
      )
    ).to.emit(eventContract, "EventCreated");

    const event = await eventContract.events(1);
    expect(event.title).to.equal("Blockchain Conference");
    expect(event.expectedGuestCount).to.equal(100);
  });

  it("Should not create an event with past start date", async function () {
    await expect(
      eventContract.createEvent(
        "Expired Event",
        "A past event",
        (await ethers.provider.getBlock("latest")).timestamp - 3600,
        (await ethers.provider.getBlock("latest")).timestamp + 3600,
        1,
        50
      )
    ).to.be.revertedWith("START DATE MUST BE IN FUTURE");
  });

  it("Should allow only the organizer to create event tickets", async function () {
    await eventContract.createEvent(
      "Exclusive Workshop",
      "A premium coding workshop",
      (await ethers.provider.getBlock("latest")).timestamp + 3600,
      (await ethers.provider.getBlock("latest")).timestamp + 7200,
      1,
      50
    );

    await expect(
      eventContract.connect(nonOrganizer).createEventTicket(1, "VIP Ticket", "VIP", ethers.parseEther("0.1"), 5, owner.address)
    ).to.be.revertedWith("ONLY ORGANIZER CAN CREATE");
  });

  it("Should allow attendees to register for a free event", async function () {
    await eventContract.createEvent(
      "Free Meetup",
      "A casual free meetup",
      (await ethers.provider.getBlock("latest")).timestamp + 3600,
      (await ethers.provider.getBlock("latest")).timestamp + 7200,
      0,
      10
    );

    await expect(eventContract.connect(attendee).registerForEvent(1))
      .to.emit(eventContract, "AttendeeConfirmed")
      .withArgs(1, attendee.address);
  });

  it("Should not allow double registration", async function () {
    await eventContract.createEvent(
      "Free Meetup",
      "A casual free meetup",
      (await ethers.provider.getBlock("latest")).timestamp + 3600,
      (await ethers.provider.getBlock("latest")).timestamp + 7200,
      0,
      10
    );

    await eventContract.connect(attendee).registerForEvent(1);

    await expect(eventContract.connect(attendee).registerForEvent(1))
      .to.be.revertedWith("ALREADY REGISTERED");
  });

  it("Should allow only the organizer to confirm attendees", async function () {
    await eventContract.createEvent(
      "Tech Fair",
      "An expo for latest tech",
      (await ethers.provider.getBlock("latest")).timestamp + 3600,
      (await ethers.provider.getBlock("latest")).timestamp + 7200,
      1,
      30
    );
    await eventContract.connect(attendee).registerForEvent(1);

    await expect(
      eventContract.connect(nonOrganizer).confirmAttendee(1, attendee.address)
    ).to.be.revertedWith("ONLY ORGANIZER CAN CONFIRM");
  });
});
