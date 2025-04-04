import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import hre from "hardhat";

describe("Event", async () => {
  async function deployEvent() {
    const [owner, account1, account2] = await hre.ethers.getSigners();
    const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'

    const eventContract = await hre.ethers.getContractFactory("EventContract")
    const EventContract = await eventContract.deploy()
    const ticket = await hre.ethers.getContractFactory("Ticket")
    const deployedTicket = await ticket.deploy("NFTName", "NNM");
    const latestTime = await time.latest();

    return { EventContract, deployedTicket, owner, account1, account2, ADDRESS_ZERO, latestTime}
  }

  describe("Deployment", () => {
    it("should test the deployer", async () => {
      const { EventContract, owner} = await loadFixture(deployEvent)
      const runner = EventContract.runner as HardhatEthersSigner

      expect(runner.address).to.equal(owner)
    })

    it('should not be address zero', async() => {
      let {EventContract, ADDRESS_ZERO} = await loadFixture(deployEvent);

      expect(EventContract.target).to.not.be.equal(ADDRESS_ZERO);
    }) 

    it("should initlize state variable to default", async () => {
      const { EventContract} = await loadFixture(deployEvent)
      
      expect(await EventContract.event_count()).to.equal(0)
    })
  })

  describe("Create Event", () => {
    
    it("should create an event", async () => {
      // const latestTime = await time.latest();
      const {EventContract, latestTime} = await loadFixture(deployEvent)
      
      const eventCountBeforeDeployment = await EventContract.event_count();
      
      await EventContract.createEvent("birthdayparty", "To celebrate birthday", latestTime + 90, BigInt(latestTime +  86400), 0, 20)
      
      const eventCountAfterDeployment = await EventContract.event_count();
      
      expect(eventCountAfterDeployment).to.be.greaterThan(eventCountBeforeDeployment);
    })
    
    it("should revert if a zero address try to create create an event", async () => {
      
      const {EventContract, account1, ADDRESS_ZERO, latestTime} = await loadFixture(deployEvent)
      await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: ["0x0000000000000000000000000000000000000000"],
      });
      const addressZeroRunner = await hre.ethers.getSigner(ADDRESS_ZERO)
      await account1.sendTransaction({
        to: addressZeroRunner.address,
        value: hre.ethers.parseEther("1.0"), // Send 1 ETH to zero address
      });
      expect(EventContract.connect(addressZeroRunner).createEvent("birthdayparty", "To celebrate birthday", latestTime + 90, BigInt(latestTime +  86400), 0, 20)).to.reverted
      expect(EventContract.connect(addressZeroRunner).createEvent("birthdayparty", "To celebrate birthday", latestTime + 90, BigInt(latestTime +  86400), 0, 20)).to.be.revertedWith("UNAUTHORIZED CALLER")
    })
  })

  describe("Register Event", () => {
    it("Should allow users to register for a free event", async function () {
      const {EventContract, owner, latestTime} = await loadFixture(deployEvent)
      // Create a free event
      await EventContract.createEvent("birthdayparty", "To celebrate birthday", latestTime + 90, BigInt(latestTime +  86400), 0, 20)
      const eventId = 1
      await EventContract.createEventTicket(
        eventId,
        "VIP Ticket",
        "VIP"
      );
      await EventContract.registerForEvent(1, { value: hre.ethers.parseEther("0")});
  
      expect(await EventContract.hasRegistered(owner.address, 1)).to.equal(true);
    });

    it("Should allow users to register for a paid event by sending ETH", async function () {
      const {EventContract, account1, latestTime} = await loadFixture(deployEvent)
      await EventContract.createEvent("birthdayparty", "To celebrate birthday", latestTime + 90, BigInt(latestTime +  86400), 1, 20)
      const eventId = 1
      await EventContract.createEventTicket(
        eventId,
        "VIP Ticket",
        "VIP"
      );
      const registerTx = await EventContract.connect(account1).registerForEvent(1, {
        value: hre.ethers.parseEther("0.1"),
      });
      await registerTx.wait();
  
      expect(await EventContract.hasRegistered(account1.address, 1)).to.equal(true);
    });
  })

  describe("Create Event Ticket", () => {
    it("Should allow the organizer to create an event ticket", async function () {
      const {EventContract, latestTime} = await loadFixture(deployEvent)
      await EventContract.createEvent("birthdayparty", "To celebrate birthday", latestTime + 90, BigInt(latestTime +  86400), 1, 20)
      const eventId = 1
      const createTicketTx = await EventContract.createEventTicket(
        eventId,
        "VIP Ticket",
        "VIP"
      );
      await createTicketTx.wait();

      const eventDetails = await EventContract.events(eventId);
      expect(eventDetails._ticketAddress).to.not.equal(hre.ethers.ZeroAddress);
    });
  })

  describe("Verify Attendee", () => {
    it("Should allow the organizer to verify attendance", async function () {
      const {EventContract, account1, latestTime} = await loadFixture(deployEvent)
      await EventContract.createEvent("birthdayparty", "To celebrate birthday", latestTime + 90, BigInt(latestTime +  86400), 0, 20)
      const eventId = 1
      await EventContract.createEventTicket(
        eventId,
        "VIP Ticket",
        "VIP"
      );
      const amount = hre.ethers.parseEther("0")
      await EventContract.connect(account1).registerForEvent(eventId, { value: amount });
      await EventContract.verifyAttendance(eventId, account1.address);
  
      expect(await EventContract.hasRegistered(account1.address, eventId)).to.equal(true);
    });
  
    it("Should revert if a non-organizer tries to verify attendance", async function () {
      const {EventContract, account2, account1, latestTime} = await loadFixture(deployEvent)
      await EventContract.createEvent("birthdayparty", "To celebrate birthday", latestTime + 90, BigInt(latestTime +  86400), 1, 20)
      const eventId = 1

      expect(EventContract.connect(account1).verifyAttendance(eventId, account2.address)).to.be.reverted;
    });
  })
})

// await EventContract.createEvent("birthdayparty", "To celebrate birthday", latestTime + 90, BigInt(latestTime +  86400), 0, 20)
//       const eventId = 1
//       await EventContract.createEventTicket(
//         eventId,
//         "VIP Ticket",
//         "VIP"
//       );
//       await EventContract.registerForEvent(1, { value: hre.ethers.parseEther("0")});