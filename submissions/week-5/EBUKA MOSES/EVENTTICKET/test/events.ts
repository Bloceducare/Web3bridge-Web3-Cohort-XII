import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";


describe("EventContract", () => {
  async function deployEventContractFixture() {
    const [owner, address1, address2] = await hre.ethers.getSigners();

    const eventContract = await hre.ethers.getContractFactory("EventContract");
    const _event = await eventContract.deploy();

    return { _event, owner, address1, address2 };
  }

  describe("Deployment", () => {
    it("should deploy the Event Contract", async () => {
      const { _event, owner } = await loadFixture(deployEventContractFixture);

      expect(await _event.event_count()).to.equal(0);
    });
  });

  describe("Create Event", () => {
    it("should create event", async () => {
      const { _event, owner } = await loadFixture(deployEventContractFixture);
      const latestTime = await time.latest();
      await _event.createEvent("Cohort XII Party", "Cohort of + 18^^^", latestTime + 30, latestTime + 86400, 1, 1, 20);
      const _event_count = await _event.event_count();
      const _eventInstance = await _event.events(_event_count);
      console.log(_eventInstance)
      expect(_eventInstance._title).to.equal("Cohort XII Party");
    });

    // it("should not create event if end time is less than start time", async () => {
    //   const { _event, owner } = await loadFixture(deployEventContractFixture);
    //   const latestTime = await time.latest();
    //   await expect(_event.createEvent("Cohort XII Party", "Cohort of + 18^^^", latestTime + 30, latestTime + 10, 1, 1, 20)).to.be.revertedWith('ENDDATE MUST BE GREATER');
    // });

    it("should not create event if start time is less than current time", async () => {
      const { _event, owner } = await loadFixture(deployEventContractFixture);
      const latestTime = await time.latest();
      await expect(_event.createEvent("Cohort XII Party", "Cohort of + 18^^^", latestTime - 30, latestTime + 10, 1, 1, 20)).to.be.revertedWith('START DATE MUST BE IN FUTURE');
    });

    it("should not create event if event is paid and fee is equal to 0", async () => {
      const { _event, owner } = await loadFixture(deployEventContractFixture);
      const latestTime = await time.latest();
      await expect(_event.createEvent("Cohort XII Party", "Cohort of + 18^^^", latestTime + 30, latestTime + 86400, 0, 1, 20)).to.be.revertedWith("Fee Required For a Paid Event");
    });

    // it("should not create if event is free and fee is greater than 0", async () => {
    //   const { _event, owner } = await loadFixture(deployEventContractFixture);
    //   const latestTime = await time.latest();
    //   await expect(_event.createEvent("Cohort XII Party", "Cohort of + 18^^^", latestTime + 30, latestTime + 86400, 1, 0, 20)).to.be.revertedWith("NO Fee Required!!");
    // });

    it("should update event mapping", async () => {
      const { _event, owner } = await loadFixture(deployEventContractFixture);
      const latestTime = await time.latest();
      await _event.createEvent("Cohort XII Party", "Cohort of + 18^^^", latestTime + 30, latestTime + 86400, 1, 1, 20);
      const _event_count = await _event.event_count();
      const _eventInstance = await _event.events(_event_count);
      await _event.createEvent("House Party", "Cohort of + 18^^^ PG13", latestTime + 30, latestTime + 86400, 1, 1, 20);
      const _event_count2 = await _event.event_count();
      const _eventInstance2 = await _event.events(_event_count2);


      expect(_eventInstance._title).to.equal("Cohort XII Party");
      expect(_eventInstance2._title).to.equal("House Party");
    });

    it("should create event ticket", async () => {
      const { _event, owner } = await loadFixture(deployEventContractFixture);
      const latestTime = await time.latest();
      await _event.createEvent("Cohort XII Party", "Cohort of + 18^^^", latestTime + 30, latestTime + 86400, 1, 1, 20);
      const _ticketInstance = await _event.ticketInstance(1);
      const _eventTicket = await hre.ethers.getContractAt("TicketNFT", _ticketInstance);



      expect(await _eventTicket.name()).to.equal("Cohort XII Party");
    });

    it('should emit EventCreated event', async () => {
      const { _event, owner } = await loadFixture(deployEventContractFixture);
      const latestTime = await time.latest();
      await expect(_event.createEvent("Cohort XII Party", "Cohort of + 18^^^", latestTime + 30, latestTime + 86400, 1, 1, 20))
        .to.emit(_event, 'EventCreated');
    });
  });

  describe("Register Event", () => {
    it("should register for event", async () => {
      const { _event, owner, address1 } = await loadFixture(deployEventContractFixture);
      const latestTime = await time.latest();
      await _event.createEvent("Cohort XII Party", "Cohort of + 18^^^", latestTime + 30, latestTime + 86400, 1, 1, 20);
      await _event.connect(address1).registerForEvent(1, { value: 1 });

      expect(await _event.getHasRegistered(1, address1.address)).to.equal(true);
    });

    it("should not register for event if event does not exist", async () => {
      const { _event, owner, address1 } = await loadFixture(deployEventContractFixture);
      await expect(_event.connect(address1).registerForEvent(1)).to.be.revertedWith('EVENT DOESNT EXIST');
    });

    it("should not register for event if event has closed", async () => {
      const { _event, owner, address1 } = await loadFixture(deployEventContractFixture);
      const latestTime = await time.latest();
      await _event.createEvent("Cohort XII Party", "Cohort of + 18^^^", latestTime + 30, latestTime + 150, 0, 0, 20);
      await time.increase(200);
      await expect(_event.connect(address1).registerForEvent(1)).to.be.revertedWith('EVENT HAS ENDED');
    });

    it("should not register for event if it exceed expected quest", async () => {
      const { _event, owner, address1 } = await loadFixture(deployEventContractFixture);
      const latestTime = await time.latest();
      await _event.createEvent("Cohort XII Party", "Cohort of + 18^^^", latestTime + 30, latestTime + 86400, 1, 1, 1);
      await _event.connect(address1).registerForEvent(1, { value: 1 });
      await expect(_event.registerForEvent(1, { value: 1 })).to.be.revertedWith('REGISTRATION CLOSED');
    });

    it('Should purchase ticket for paid event', async () => {
      const { _event, owner, address1 } = await loadFixture(deployEventContractFixture);
      const latestTime = await time.latest();
      await _event.createEvent("Cohort XII Party", "Cohort of + 18^^^", latestTime + 30, latestTime + 86400, 1, 1, 20);
      await _event.connect(address1).registerForEvent(1, { value: 1 });
      const _ticketInstance = await _event.ticketInstance(1);
      const _eventTicket = await hre.ethers.getContractAt("TicketNFT", _ticketInstance);
      expect(await _eventTicket.balanceOf(address1.address)).to.equal(1);
    });


    it('should emit EventRegistered event', async () => {
      const { _event, owner, address1 } = await loadFixture(deployEventContractFixture);
      const latestTime = await time.latest();
      await _event.createEvent("Cohort XII Party", "Cohort of + 18^^^", latestTime + 30, latestTime + 86400, 1, 1, 20);
      await expect(_event.connect(address1).registerForEvent(1, { value: 1 }))
        .to.emit(_event, 'RegisterEvent');
    })
  });

  describe("Verify Attendees", () => {
    it("should verify attendance", async () => {
      const { _event, owner, address1 } = await loadFixture(deployEventContractFixture);
      const latestTime = await time.latest();
      await _event.createEvent("Cohort XII Party", "Cohort of + 18^^^", latestTime + 30, latestTime + 86400, 1, 1, 20);
      await _event.connect(address1).registerForEvent(1, { value: 1 });
      await _event.verifyAttendance(1, 1);

      expect(await _event.isVerifiedTicket(1, 1)).to.equal(true);
    });

    it("should not verify attendee if event does not exist", async () => {
      const { _event, owner, address1 } = await loadFixture(deployEventContractFixture);
      await expect(_event.verifyAttendance(1, 1)).to.be.revertedWith('EVENT DOESNT EXIST');
    });

    it('should allow only organizer to verify attendance', async () => {
      const { _event, owner, address1, address2 } = await loadFixture(deployEventContractFixture);
      const latestTime = await time.latest();
      await _event.createEvent("Cohort XII Party", "Cohort of + 18^^^", latestTime + 30, latestTime + 86400, 1, 1, 20);
      await _event.connect(address1).registerForEvent(1, { value: 1 });
      await expect(_event.connect(address2).verifyAttendance(1, 1)).to.be.revertedWith('ONLY ORGANIZER CAN VERIFY');
    });

    // it('should increase verified guest count', async () => {
    //   const { _event, owner, address1 } = await loadFixture(deployEventContractFixture);
    //   const latestTime = await time.latest();
    //   await _event.createEvent("Cohort XII Party", "Cohort of + 18^^^", latestTime + 30, latestTime + 86400, 1, 1, 20);
    //   await _event.connect(address1).registerForEvent(1, { value: 1 });
    //   await _event.verifyAttendance(1, 1);
    //   expect(await (await _event.events(1))._verifiedGuestCount).to.equal(1);
    // });

    it('should emit Verified Ticket event', async () => {
      const { _event, owner, address1 } = await loadFixture(deployEventContractFixture);
      const latestTime = await time.latest();
      await _event.createEvent("Cohort XII Party", "Cohort of + 18^^^", latestTime + 30, latestTime + 86400, 1, 1, 20);
      await _event.connect(address1).registerForEvent(1, { value: 1 });
      await expect(_event.verifyAttendance(1, 1))
        .to.emit(_event, 'VerifiedTicket');
    });
  });
});