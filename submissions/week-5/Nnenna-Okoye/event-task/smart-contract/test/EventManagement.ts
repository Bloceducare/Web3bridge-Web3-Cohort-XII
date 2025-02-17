import { time, loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("EventManagement", function () {
  async function deployEventContractFixture() {
    const [owner, user1, user2] = await hre.ethers.getSigners();
    const EventContract = await hre.ethers.getContractFactory("EventManagement");
    const eventContract = await EventContract.deploy();
    return { eventContract, owner, user1, user2 };
  }

  describe("Deployment", function () {
    it("Should deploy the contract", async function () {
      const { eventContract } = await loadFixture(deployEventContractFixture);
      expect(await eventContract.event_count()).to.equal(0);
    });
  });

  describe("Create Event", function () {
    it("Should create an event", async function () {
      const { eventContract } = await loadFixture(deployEventContractFixture);
      const startTime = (await time.latest()) + 100;
      const endTime = startTime + 86400;

      await eventContract.createEvent("Tech Meetup", "Networking event", startTime, endTime, 0, 50);
      const eventDetails = await eventContract.events(1);

      expect(eventDetails.title).to.equal("Tech Meetup");
    });

    it("Should revert if start date is in the past", async function () {
      const { eventContract } = await loadFixture(deployEventContractFixture);
      const pastTime = (await time.latest()) - 100;

      await expect(
        eventContract.createEvent("Tech Meetup", "Networking event", pastTime, pastTime + 86400, 0, 50)
      ).to.be.revertedWith("Start date must be set in the future");
    });
  });

  describe("Register for Event", function () {
    it("Should allow users to register", async function () {
      const { eventContract, user1 } = await loadFixture(deployEventContractFixture);
      const startTime = (await time.latest()) + 100;
      const endTime = startTime + 86400;

      await eventContract.createEvent("Tech Meetup", "Networking event", startTime, endTime, 0, 50);
      await eventContract.connect(user1).registerForEvent(1);

      expect(await eventContract.hasRegistered(user1.address, 1)).to.equal(true);
    });

    it("Should revert if event has ended", async function () {
      const { eventContract, user1 } = await loadFixture(deployEventContractFixture);
      const startTime = (await time.latest()) + 100;
      const endTime = startTime + 200;

      await eventContract.createEvent("Tech Meetup", "Networking event", startTime, endTime, 0, 50);
      await time.increase(300);

      await expect(eventContract.connect(user1).registerForEvent(1)).to.be.revertedWith("This event has already ended");
    });
  });

  describe("Verify Attendance", function () {
    it("Should allow organizer to verify attendance", async function () {
      const { eventContract, owner, user1 } = await loadFixture(deployEventContractFixture);
      const startTime = (await time.latest()) + 100;
      const endTime = startTime + 86400;

      await eventContract.createEvent("Tech Meetup", "Networking event", startTime, endTime, 0, 50);
      await eventContract.connect(user1).registerForEvent(1);
      await eventContract.verifyAttendance(1, 1);

      expect(await eventContract.hasVerifiedAttendance(1, 1)).to.equal(true);
    });

    it("Should revert if non-organizer tries to verify attendance", async function () {
      const { eventContract, user1, user2 } = await loadFixture(deployEventContractFixture);
      const startTime = (await time.latest()) + 100;
      const endTime = startTime + 86400;

      await eventContract.createEvent("Tech Meetup", "Networking event", startTime, endTime, 0, 50);
      await eventContract.connect(user1).registerForEvent(1);

      await expect(eventContract.connect(user2).verifyAttendance(1, 1)).to.be.revertedWith(
        "Only the event organizer can verify attendance"
      );
    });
  });
});
