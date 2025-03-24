import { expect } from "chai";
import { ethers } from "hardhat";

describe("EventContract", function () {
  let eventContract: any;
  let owner: any, buyer: any;

  beforeEach(async function () {
    [owner, buyer] = await ethers.getSigners();
    const EventContract = await ethers.getContractFactory("EventContract");
    eventContract = await EventContract.deploy();
    await eventContract.waitForDeployment();
  });

  it("Should create an event", async function () {
    const createTx = await eventContract.createEvent(
      "Blockchain Summit",
      "An event for blockchain enthusiasts",
      Math.floor(Date.now() / 1000) + 3600,  //  1h dans le futur
      Math.floor(Date.now() / 1000) + 86400, //  24h après
      1, // Paid event
      100 // 100 invités attendus
    );
    await createTx.wait();

    const eventDetails = await eventContract.events(1);
    expect(eventDetails.title).to.equal("Blockchain Summit");
    expect(eventDetails.organizer).to.equal(owner.address);
    expect(eventDetails.eventType).to.equal(1); // Vérifier que l'événement est bien "Paid"
  });

  it("Should create a ticket for an event", async function () {
    await eventContract.createEvent(
      "Blockchain Summit",
      "An event for blockchain enthusiasts",
      Math.floor(Date.now() / 1000) + 3600,
      Math.floor(Date.now() / 1000) + 86400,
      1,
      100
    );

    const ticketTx = await eventContract.createEventTicket(1, "VIP Ticket", "VIP", "https://example.com/metadata/");
    await ticketTx.wait();

    const eventDetails = await eventContract.events(1);
    expect(eventDetails.ticketAddress).to.not.equal(ethers.ZeroAddress);
  });

  it("Should allow a user to purchase a ticket", async function () {
    await eventContract.createEvent(
      "Blockchain Summit",
      "An event for blockchain enthusiasts",
      Math.floor(Date.now() / 1000) + 3600,
      Math.floor(Date.now() / 1000) + 86400,
      1, // Paid event
      100
    );

    await eventContract.createEventTicket(1, "VIP Ticket", "VIP", "https://example.com/metadata/");

    const purchaseTx = await eventContract.connect(buyer).purchaseTicket(1, "https://example.com/ticket-image/");
    await purchaseTx.wait();

    const registered = await eventContract.hasRegistered(buyer.address, 1);
    expect(registered).to.be.true;
  });

  it("Should confirm attendance of a registered user", async function () {
    await eventContract.createEvent(
      "Blockchain Summit",
      "An event for blockchain enthusiasts",
      Math.floor(Date.now() / 1000) + 3600,
      Math.floor(Date.now() / 1000) + 86400,
      1, // Paid event
      100
    );

    await eventContract.createEventTicket(1, "VIP Ticket", "VIP", "https://example.com/metadata/");

    await eventContract.connect(buyer).purchaseTicket(1, "https://example.com/ticket-image/");

    const confirmTx = await eventContract.confirmAttendance(1, buyer.address);
    await confirmTx.wait();

    const eventDetails = await eventContract.events(1);
    expect(eventDetails.verifiedGuestCount).to.equal(1);
  });
});
