const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EventContract", function () {
  let EventContract, eventContract, Tickets, owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy EventContract
    EventContract = await ethers.getContractFactory("EventContract");
    eventContract = await EventContract.deploy();
    await eventContract.waitForDeployment();
  });

  it("Should create an event", async function () {
    await expect(
      eventContract.createEvent(
        "Blockchain Summit",
        "A major blockchain event",
        Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
        Math.floor(Date.now() / 1000) + 7200, // 2 hours from now
        0, // Free event
        0, // No price for free event
        100 // Expected guest count
      )
    ).to.emit(eventContract, "EventCreated");

    const eventDetails = await eventContract.events(1);
    expect(eventDetails.title).to.equal("Blockchain Summit");
    expect(eventDetails.eventType).to.equal(0); // Free event
  });

  it("Should create event tickets", async function () {
    await eventContract.createEvent(
      "NFT Expo",
      "An exclusive NFT event",
      Math.floor(Date.now() / 1000) + 3600,
      Math.floor(Date.now() / 1000) + 7200,
      1, // Paid event
      ethers.parseEther("0.1"), // 0.1 ETH ticket price
      50 // Expected guests
    );

    const tx = await eventContract.createEventTicket(1, "NFTTicket", "NFTX");
    const receipt = await tx.wait();

    const eventDetails = await eventContract.events(1);
    expect(eventDetails.ticketAddress).to.not.equal(ethers.AddressZero);
  });

  it("Should allow users to register for a free event", async function () {
    await eventContract.createEvent(
      "Web3 Meetup",
      "A networking event",
      Math.floor(Date.now() / 1000) + 3600,
      Math.floor(Date.now() / 1000) + 7200,
      0, // Free event
      0, // No price
      30
    );

    const tx = await eventContract.createEventTicket(1, "MeetupTicket", "MTKT");
    const receipt = await tx.wait();
    const eventDetails = await eventContract.events(1);
    const ticketContract = await ethers.getContractAt("Tickets", eventDetails.ticketAddress);

    // Register user
    await expect(eventContract.connect(addr1).registerForEvent(1))
      .to.emit(eventContract, "TicketMinted")
      .withArgs(1, addr1.address, 1);

    expect(await ticketContract.ownerOf(1)).to.equal(addr1.address);
  });

  it("Should allow users to register for a paid event", async function () {
    await eventContract.createEvent(
      "Solidity Workshop",
      "Learn Solidity with experts",
      Math.floor(Date.now() / 1000) + 3600,
      Math.floor(Date.now() / 1000) + 7200,
      1, // Paid event
      ethers.parseEther("0.05"), // 0.05 ETH per ticket
      20
    );

    const tx = await eventContract.createEventTicket(1, "WorkshopTicket", "WTKT");
    const receipt = await tx.wait();
    const eventDetails = await eventContract.events(1);
    const ticketContract = await ethers.getContractAt("Tickets", eventDetails.ticketAddress);

    // Register user with the correct payment
    await expect(eventContract.connect(addr1).registerForEvent(1, { value: ethers.parseEther("0.05") }))
      .to.emit(eventContract, "TicketPurchased")
      .withArgs(1, addr1.address, ethers.parseEther("0.05"));

    expect(await ticketContract.ownerOf(1)).to.equal(addr1.address);
  });

  it("Should prevent double registration", async function () {
    await eventContract.createEvent(
      "Blockchain Bootcamp",
      "Intensive blockchain course",
      Math.floor(Date.now() / 1000) + 3600,
      Math.floor(Date.now() / 1000) + 7200,
      0, // Free event
      0, // No price
      10
    );

    await eventContract.createEventTicket(1, "BootcampTicket", "BCTK");

    // Register user
    await eventContract.connect(addr1).registerForEvent(1);

    // Try to register again
    await expect(eventContract.connect(addr1).registerForEvent(1)).to.be.revertedWith("ALREADY REGISTERED");
  });

  it("Should prevent underpayment for a paid event", async function () {
    await eventContract.createEvent(
      "VIP Gala",
      "Exclusive event",
      Math.floor(Date.now() / 1000) + 3600,
      Math.floor(Date.now() / 1000) + 7200,
      1, // Paid event
      ethers.parseEther("0.1"), // 0.1 ETH per ticket
      5
    );

    await eventContract.createEventTicket(1, "VIPTicket", "VIPX");

    // Attempt to register with insufficient funds
    await expect(eventContract.connect(addr1).registerForEvent(1, { value: ethers.parseEther("0.05") }))
      .to.be.revertedWith("INSUFFICIENT PAYMENT");
  });

  it("Should correctly update guest count", async function () {
    await eventContract.createEvent(
      "DAO Hackathon",
      "Build the future of DAOs",
      Math.floor(Date.now() / 1000) + 3600,
      Math.floor(Date.now() / 1000) + 7200,
      0, // Free event
      0,
      50
    );

    await eventContract.createEventTicket(1, "HackathonPass", "HACK");

    expect(await eventContract.getRegisteredGuestCount(1)).to.equal(0);

    await eventContract.connect(addr1).registerForEvent(1);
    expect(await eventContract.getRegisteredGuestCount(1)).to.equal(1);
  });
});
