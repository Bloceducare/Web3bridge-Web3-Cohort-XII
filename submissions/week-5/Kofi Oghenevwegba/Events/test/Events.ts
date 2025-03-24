import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("EventFactory", () => {
  async function eventFactoryFixture() {
    const ONE_HOUR = 3600;
    const ONE_DAY = 86400;
    const START_DATE = (await time.latest()) + ONE_DAY;
    const END_DATE = START_DATE + ONE_HOUR;
    
    const [owner, organizer, attendee1, attendee2] = await hre.ethers.getSigners();

    // Deploy ERC20 token
    const Token = await hre.ethers.getContractFactory('Based');
    const paymentToken = await Token.deploy(owner.address);

    // Mint and transfer tokens
    const mintAmount = hre.ethers.parseEther("200");
    await paymentToken.connect(owner).mint(owner.address, mintAmount);
    await paymentToken.transfer(attendee1.address, hre.ethers.parseEther("100"));
    await paymentToken.transfer(attendee2.address, hre.ethers.parseEther("100"));

    // Deploy EventFactory
    const EventFactory = await hre.ethers.getContractFactory("EventFactory");
    const eventFactory = await EventFactory.deploy();

    // Approve EventFactory for attendees
    await paymentToken.connect(attendee1).approve(eventFactory.target, hre.ethers.MaxUint256);
    await paymentToken.connect(attendee2).approve(eventFactory.target, hre.ethers.MaxUint256);

    return { eventFactory, paymentToken, owner, organizer, attendee1, attendee2, START_DATE, END_DATE, ONE_DAY };
  }

  describe("Event Creation", () => {
    it("Should create event with correct parameters", async () => {
      const { eventFactory, organizer, START_DATE, END_DATE, paymentToken } = await loadFixture(eventFactoryFixture);
      
      const tx = await eventFactory.connect(organizer).createEvent(
        "Tech Conference",
        START_DATE,
        END_DATE,
        1, // PAID event
        500,
        "Conference Ticket",
        "CT",
        paymentToken.target,
        hre.ethers.parseEther("0.5")
      );
      await tx.wait();

      const event = await eventFactory.getEvent(1);
      expect(event.title).to.equal("Tech Conference");
      expect(event.eventType).to.equal(1); // PAID
      expect(event.ticketPrice).to.equal(hre.ethers.parseEther("0.5"));
    });
  });

  describe("Ticket Purchase", () => {
    it("Should prevent overcapacity", async () => {
      const { eventFactory, organizer, attendee1, START_DATE, END_DATE, paymentToken } = await loadFixture(eventFactoryFixture);
      
      await eventFactory.connect(organizer).createEvent(
        "Exclusive Event",
        START_DATE,
        END_DATE,
        0, // FREE
        1, // Max capacity 1
        "Exclusive",
        "EXCL",
        paymentToken.target,
        0
      );

      // First ticket
      await eventFactory.connect(attendee1).buyTicket(1);
      // Second ticket should fail
      await expect(eventFactory.connect(attendee1).buyTicket(1))
        .to.be.revertedWith("Event full");
    });
  });

  describe("Attendance Verification", () => {
    it("Should verify attendance correctly", async () => {
      const { eventFactory, organizer, attendee1, START_DATE, END_DATE, paymentToken, ONE_DAY } = await loadFixture(eventFactoryFixture);
      
      await eventFactory.connect(organizer).createEvent(
        "Workshop",
        START_DATE,
        END_DATE,
        0,
        50,
        "Workshop Ticket",
        "WS",
        paymentToken.target,
        0
      );

      await eventFactory.connect(attendee1).buyTicket(1);
      await time.increase(ONE_DAY + 1);

      await expect(eventFactory.connect(organizer).verifyAttendance(1, attendee1.address))
        .to.emit(eventFactory, "AttendanceVerified");
    });
  });
});