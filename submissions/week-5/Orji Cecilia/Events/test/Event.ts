import { time, loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";

describe("EventContract", function () {
  async function deployEventContract() {
    const [owner, account1, account2] = await ethers.getSigners();
    const EventContract = await ethers.getContractFactory("EventContract");
    const deployEvent = await EventContract.deploy(owner.address);

    await deployEvent.waitForDeployment(); 

    return { deployEvent, owner, account1, account2 };
  }

  describe("Deployment", function () {
    it("should be deployed by owner", async function () {
      const { deployEvent, owner } = await loadFixture(deployEventContract);
      expect(await deployEvent.organizer()).to.equal(owner.address);
    });

    it("should have a valid address", async function () {
      const { deployEvent } = await loadFixture(deployEventContract);
      expect(await deployEvent.getAddress()).to.not.equal(ethers.ZeroAddress);
    });
  });

  describe("Create Event", function () {
    it("should create an event", async function () {
      const { deployEvent } = await loadFixture(deployEventContract);
      const latestTime = await time.latest();

      const eventCountBefore = await deployEvent.event_count();
      await deployEvent.createEvent("Pool Party", "Come with your baddie", latestTime + 90, latestTime + 86400, 0, 20, 0);
      const eventCountAfter = await deployEvent.event_count();

      expect(eventCountAfter).to.be.greaterThan(eventCountBefore);
    });

    it("should revert if start date is in the past", async function () {
      const { deployEvent } = await loadFixture(deployEventContract);
      const latestTime = await time.latest();

      await expect(
        deployEvent.createEvent("Time Travel Party", "This event should fail", latestTime - 1000, latestTime + 86400, 0, 50, 0)
      ).to.be.revertedWith("START DATE MUST BE IN FUTURE");
    });

    it("should allow creating a paid event", async function () {
      const { deployEvent } = await loadFixture(deployEventContract);
      const latestTime = await time.latest();

      await deployEvent.createEvent("VIP Concert", "Exclusive access concert", latestTime + 90, latestTime + 86400, 1, 100, ethers.parseEther("0.05"));
      const eventDetails = await deployEvent.events(1);

      expect(eventDetails._ticketPrice).to.equal(ethers.parseEther("0.05"));
    });
  });

  describe("Create Event Ticket", function () {
    it("should allow the organizer to create event tickets", async function () {
      const { deployEvent, owner } = await loadFixture(deployEventContract);
      const latestTime = await time.latest();

      await deployEvent.createEvent("Music Festival", "Biggest party of the year", latestTime + 100, latestTime + 86400, 1, 100, ethers.parseEther("0.1"));
      await deployEvent.createEventTicket(1, "VIP Ticket", "VIP");

      const eventDetails = await deployEvent.events(1);
      expect(eventDetails._ticketAddress).to.not.equal(ethers.ZeroAddress);
    });

    it("should not allow non-organizers to create tickets", async function () {
      const { deployEvent, account1 } = await loadFixture(deployEventContract);
      const latestTime = await time.latest();

      await deployEvent.createEvent("Tech Conference", "Learn about blockchain", latestTime + 200, latestTime + 86400, 1, 50, ethers.parseEther("0.05"));

      await expect(deployEvent.connect(account1).createEventTicket(1, "Standard Ticket", "ST")).to.be.revertedWith("ONLY ORGANIZER CAN CALL"); // ✅ Fixed Revert Message
    });
  });

  describe("Purchase Ticket and NFT minting", function () {
    it("should allow users to purchase tickets for paid events", async function () {
      const { deployEvent, account1 } = await loadFixture(deployEventContract);
      const latestTime = await time.latest();

      await deployEvent.createEvent("Crypto Summit", "Blockchain and Web3", latestTime + 300, latestTime + 86400, 1, 50, ethers.parseEther("0.05"));
      await deployEvent.createEventTicket(1, "General Admission", "GA");

      await expect(deployEvent.connect(account1).purchaseTicket(1, { value: ethers.parseEther("0.05") }))
        .to.emit(deployEvent, "TicketPurchased")
        .withArgs(1, account1.address);
    });

    it("should revert if the ticket price is incorrect", async function () {
      const { deployEvent, account1 } = await loadFixture(deployEventContract);
      const latestTime = await time.latest();

      await deployEvent.createEvent("AI Conference", "The future of AI", latestTime + 500, latestTime + 86400, 1, 30, ethers.parseEther("0.2"));
      await deployEvent.createEventTicket(1, "AI Pass", "AIP");

      await expect(deployEvent.connect(account1).purchaseTicket(1, { value: ethers.parseEther("0.1") })).to.be.revertedWith("INCORRECT TICKET PRICE");
    });

    it("should allow free event registration without payment", async function () {
      const { deployEvent, account1 } = await loadFixture(deployEventContract);
      const latestTime = await time.latest();

      await deployEvent.createEvent("Open Hackathon", "Free for all developers", latestTime + 600, latestTime + 86400, 0, 100, 0);
      await deployEvent.createEventTicket(1, "Hackathon Ticket", "HT");

      await deployEvent.connect(account1).purchaseTicket(1);
      const eventDetails = await deployEvent.events(1);

      expect(eventDetails._registeredGuestCount).to.equal(1);
    });
  });

  describe("Verify Attendance", function () {
    it("should allow the organizer to verify attendance", async function () {
      const { deployEvent, account1, owner } = await loadFixture(deployEventContract);
      const latestTime = await time.latest();

      await deployEvent.createEvent("Gaming Expo", "Esports tournament", latestTime + 700, latestTime + 86400, 1, 200, ethers.parseEther("0.05"));
      await deployEvent.createEventTicket(1, "VIP Gamer Pass", "VGP");
      await deployEvent.connect(account1).purchaseTicket(1, { value: ethers.parseEther("0.05") });

      await deployEvent.verifyAttendance(1, account1.address);
      const eventDetails = await deployEvent.events(1);

      expect(eventDetails._verifiedGuestCount).to.equal(1);
    });

    it("should not allow non-organizers to verify attendance", async function () {
      const { deployEvent, account1, account2 } = await loadFixture(deployEventContract);
      const latestTime = await time.latest();

      await deployEvent.createEvent("Metaverse Meetup", "Explore virtual reality", latestTime + 800, latestTime + 86400, 1, 100, ethers.parseEther("0.05"));
      await deployEvent.createEventTicket(1, "Metaverse Ticket", "MT");
      await deployEvent.connect(account1).purchaseTicket(1, { value: ethers.parseEther("0.05") });

      await expect(deployEvent.connect(account2).verifyAttendance(1, account1.address)).to.be.revertedWith("ONLY ORGANIZER CAN CALL"); // ✅ Fixed Revert Message
    });
  });
});
