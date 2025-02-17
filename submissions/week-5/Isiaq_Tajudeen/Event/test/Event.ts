import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { parseUnits } from "ethers";
import hre from "hardhat";

describe("Event", () => {
  const deployEventContract = async () => {
    const [owner, account2, account3, account4, account5] =
      await hre.ethers.getSigners();

    const USDB = await hre.ethers.getContractFactory("USDB");
    const usdbDeploy = await USDB.deploy();

    const Event = await hre.ethers.getContractFactory("Event");
    const deployEvent = await Event.deploy();

    return {
      deployEvent,
      usdbDeploy,
      owner,
      account2,
      account3,
      account4,
      account5,
    };
  };

  describe("Deployment", () => {
    it("Should set the right owner", async () => {
      const { deployEvent, owner } = await loadFixture(deployEventContract);

      const runner = deployEvent.runner as HardhatEthersSigner;

      expect(runner.address).to.equal(owner.address);
    });

    it("Should set owner not to be address zero", async () => {
      const { deployEvent } = await loadFixture(deployEventContract);

      //   expect(deployEvent.target).to.not.be.equal(addressZero);
      expect(deployEvent.owner).to.not.be.equal(
        "0x000000000000000000000000000000000000000"
      );
    });
  });

  describe("Create Event", () => {
    it("Should create an event", async () => {
      const { deployEvent, account2, account3 } = await loadFixture(
        deployEventContract
      );

      const eventCountBeforeCreation = await deployEvent.eventCount();

      const START_DATE_IN_SECS = 7 * 24 * 60 * 60;
      const END_DATE_IN_SECS = 17 * 60 * 60;

      const event = {
        title: "Tech Meet Up",
        desc: "blablabla",
        startDate: (await time.latest()) + START_DATE_IN_SECS,
        endDate: (await time.latest()) + START_DATE_IN_SECS + END_DATE_IN_SECS,
        eventType: 0,
        expectedGuest: 20,
        // registerGuestCount: 0,
        // verifiedGuestCount: 0,
        // organiser: account2,
      };

      const createEvent1 = await deployEvent
        .connect(account2)
        .createEvent(
          event.title,
          event.desc,
          event.startDate,
          event.endDate,
          event.eventType,
          event.expectedGuest
        );

      const createEvent2 = await deployEvent
        .connect(account3)
        .createEvent(
          "Lisk hackaton",
          "blablabla",
          BigInt((await time.latest()) + 24 * 60 * 60),
          BigInt((await time.latest()) + 2 * 24 * 60 * 60),
          1,
          40
        );

      const eventCountAfterCreation = await deployEvent.eventCount();

      const latestTime = await time.latest();

      expect(event.startDate)
        .to.be.greaterThan(latestTime)
        .to.be.revertedWith("Start date must be in future");

      expect(event.endDate)
        .to.be.greaterThan(event.startDate)
        .to.be.revertedWith("End date must be greater");

      expect(eventCountAfterCreation).to.be.greaterThan(
        eventCountBeforeCreation
      );

      expect(createEvent1)
        .to.emit(deployEvent, "EventCreated")
        .withArgs(eventCountAfterCreation, account2.address);

      expect(createEvent2)
        .to.emit(deployEvent, "EventCreated")
        .withArgs(eventCountAfterCreation, account2.address);
    });
  });

  describe("Create Event Ticket", () => {
    it("Should create event ticket", async () => {
      const { deployEvent } = await loadFixture(deployEventContract);

      await deployEvent.createEvent(
        "Lisk hackaton",
        "blablabla",
        BigInt((await time.latest()) + 24 * 60 * 60),
        BigInt((await time.latest()) + 2 * 24 * 60 * 60),
        1,
        40
      );

      const eventId = await deployEvent.eventCount();

      const ticketUri =
        "https://gateway.pinata.cloud/ipfs/QmTXNQNNhFkkpCaCbHDfzbUCjXQjQnhX7QFoX1YVRQCSC8";

      await deployEvent.createEventTicket(
        eventId,
        parseUnits("100", 18),
        ticketUri,
        "VALENTINE",
        "VAL"
      );
    });
  });

  describe("Register For Event", () => {
    it("Should check if event exist and id is not zero value", async () => {
      const { deployEvent, account2, usdbDeploy } = await loadFixture(
        deployEventContract
      );

      usdbDeploy.transfer(account2, parseUnits("500", 18));

      const tickectPrice = parseUnits("10", 18);

      // eventCountBeforeCreation
      const zeroValue = await deployEvent.eventCount();

      await deployEvent.createEvent(
        "Lisk hackaton",
        "blablabla",
        BigInt((await time.latest()) + 24 * 60 * 60),
        BigInt((await time.latest()) + 2 * 24 * 60 * 60),
        1,
        40
      );

      //eventCountAfterCreation
      const eventId = await deployEvent.eventCount();

      const ticketUri =
        "https://gateway.pinata.cloud/ipfs/QmTXNQNNhFkkpCaCbHDfzbUCjXQjQnhX7QFoX1YVRQCSC8";

      await deployEvent.createEventTicket(
        eventId,
        tickectPrice,
        ticketUri,
        "VALENTINE",
        "VAL"
      );

      expect(eventId)
        .to.be.lessThanOrEqual(await deployEvent.eventCount())
        .revertedWith("Event doesn't exist");
      expect(eventId).not.to.be.equal(0).revertedWith("Event doesn't exist");
    });

    it("Should check if event has ended", async () => {
      const { deployEvent, account2, usdbDeploy } = await loadFixture(
        deployEventContract
      );

      const START_DATE_IN_SECS = 7 * 24 * 60 * 60;
      const END_DATE_IN_SECS = 17 * 60 * 60;

      const event = {
        title: "Tech Meet Up",
        desc: "blablabla",
        startDate: (await time.latest()) + START_DATE_IN_SECS,
        endDate: (await time.latest()) + START_DATE_IN_SECS + END_DATE_IN_SECS,
        eventType: 0,
        expectedGuest: 2,
      };

      await deployEvent
        .connect(account2)
        .createEvent(
          event.title,
          event.desc,
          event.startDate,
          event.endDate,
          event.eventType,
          event.expectedGuest
        );

      await time.increaseTo(event.endDate + 1);

      await expect(
        deployEvent.registerForEvent(1, usdbDeploy.getAddress())
      ).to.be.revertedWith("Event has ended");
    });

    it("Should check if registration has closed", async () => {
      const {
        deployEvent,
        usdbDeploy,
        account2,
        account3,
        account4,
        account5,
      } = await loadFixture(deployEventContract);

      const START_DATE_IN_SECS = 7 * 24 * 60 * 60;
      const END_DATE_IN_SECS = 17 * 60 * 60;

      const event = {
        title: "Tech Meet Up",
        desc: "blablabla",
        startDate: (await time.latest()) + START_DATE_IN_SECS,
        endDate: (await time.latest()) + START_DATE_IN_SECS + END_DATE_IN_SECS,
        eventType: 0,
        expectedGuest: 2,
      };

      await deployEvent
        .connect(account2)
        .createEvent(
          event.title,
          event.desc,
          event.startDate,
          event.endDate,
          event.eventType,
          event.expectedGuest
        );

      const ticketUri =
        "https://gateway.pinata.cloud/ipfs/QmTXNQNNhFkkpCaCbHDfzbUCjXQjQnhX7QFoX1YVRQCSC8";
      await deployEvent
        .connect(account2)
        .createEventTicket(1, 0, ticketUri, "TICKET", "TKT");

      // Register first two users
      await deployEvent
        .connect(account3)
        .registerForEvent(1, usdbDeploy.getAddress());
      await deployEvent
        .connect(account4)
        .registerForEvent(1, usdbDeploy.getAddress());

      await expect(
        deployEvent
          .connect(account5)
          .registerForEvent(1, usdbDeploy.getAddress())
      ).to.be.revertedWith("Registration has closed");
    });

    it("Should revert if user has already registered", async () => {
      const { deployEvent, usdbDeploy, account2, account3 } = await loadFixture(
        deployEventContract
      );

      const START_DATE_IN_SECS = 7 * 24 * 60 * 60;
      const END_DATE_IN_SECS = 17 * 60 * 60;

      const event = {
        title: "Tech Meet Up",
        desc: "blablabla",
        startDate: (await time.latest()) + START_DATE_IN_SECS,
        endDate: (await time.latest()) + START_DATE_IN_SECS + END_DATE_IN_SECS,
        eventType: 0,
        expectedGuest: 2,
      };

      await deployEvent
        .connect(account2)
        .createEvent(
          event.title,
          event.desc,
          event.startDate,
          event.endDate,
          event.eventType,
          event.expectedGuest
        );

      const ticketUri =
        "https://gateway.pinata.cloud/ipfs/QmTXNQNNhFkkpCaCbHDfzbUCjXQjQnhX7QFoX1YVRQCSC8";
      await deployEvent
        .connect(account2)
        .createEventTicket(1, 0, ticketUri, "TICKET", "TKT");

      await deployEvent
        .connect(account3)
        .registerForEvent(1, usdbDeploy.getAddress());

      await expect(
        deployEvent
          .connect(account3)
          .registerForEvent(1, usdbDeploy.getAddress())
      ).to.be.revertedWith("This user has already registered");
    });

    it("Should register for event whether paid or free", async () => {
      const { deployEvent, account2, usdbDeploy } = await loadFixture(
        deployEventContract
      );

      await usdbDeploy.transfer(account2, parseUnits("500", 18));
      const ticketPrice = parseUnits("10", 18);

      await deployEvent.createEvent(
        "Lisk hackaton",
        "blablabla",
        BigInt((await time.latest()) + 24 * 60 * 60),
        BigInt((await time.latest()) + 2 * 24 * 60 * 60),
        1,
        40
      );

      const eventId = await deployEvent.eventCount();

      const ticketUri =
        "https://gateway.pinata.cloud/ipfs/QmTXNQNNhFkkpCaCbHDfzbUCjXQjQnhX7QFoX1YVRQCSC8";

      await deployEvent.createEventTicket(
        eventId,
        ticketPrice,
        ticketUri,
        "VALENTINE",
        "VAL"
      );

      await usdbDeploy.approve(await deployEvent.getAddress(), ticketPrice);

      await expect(
        deployEvent.registerForEvent(eventId, await usdbDeploy.getAddress())
      ).to.not.be.reverted;
    });
  });
});
