import { expect } from "chai";
import { ethers } from "hardhat";
import { EventContract, Tickets } from "../typechain-types";

describe("EventContract", function () {
    let eventContract: EventContract;
    let ticketsContract: Tickets;
    let owner: any;
    let attendee1: any;
    let attendee2: any;

    beforeEach(async function () {
        [owner, attendee1, attendee2] = await ethers.getSigners();

        // Deploy EventContract
        const EventContractFactory = await ethers.getContractFactory("EventContract");
        eventContract = await EventContractFactory.deploy();
        await eventContract.deployed();
    });

    it("Should create an event", async function () {
        const title = "Tech Conference";
        const description = "Annual tech conference";
        const startDate = Math.floor(Date.now() / 1000) + 86400; // 1 day in the future
        const endDate = Math.floor(Date.now() / 1000) + 172800; // 2 days in the future
        const eventType = 0; // Free event
        const expectedGuestCount = 100;

        await eventContract.createEvent(title, description, startDate, endDate, eventType, expectedGuestCount);

        const event = await eventContract.events(1);
        expect(event._title).to.equal(title);
        expect(event._description).to.equal(description);
        expect(event._startDate.toNumber()).to.equal(startDate);
        expect(event._endDate.toNumber()).to.equal(endDate);
        expect(event._type).to.equal(eventType);
        expect(event._expectedGuestCount).to.equal(expectedGuestCount);
    });

    it("Should register for a free event", async function () {
        const title = "Free Workshop";
        const description = "Free coding workshop";
        const startDate = Math.floor(Date.now() / 1000) + 86400; // 1 day in the future
        const endDate = Math.floor(Date.now() / 1000) + 172800; // 2 days in the future
        const eventType = 0; // Free event
        const expectedGuestCount = 50;

        await eventContract.createEvent(title, description, startDate, endDate, eventType, expectedGuestCount);
        await eventContract.createEventTicket(1, "FreeTicket", "FTK");

        await eventContract.connect(attendee1).registerForEvent(1);

        const registered = await eventContract.hasRegistered(attendee1.address, 1);
        expect(registered).to.be.true;
    });

    it("Should purchase a ticket for a paid event", async function () {
        const title = "Paid Conference";
        const description = "Exclusive conference";
        const startDate = Math.floor(Date.now() / 1000) + 86400; // 1 day in the future
        const endDate = Math.floor(Date.now() / 1000) + 172800; // 2 days in the future
        const eventType = 1; // Paid event
        const expectedGuestCount = 50;

        await eventContract.createEvent(title, description, startDate, endDate, eventType, expectedGuestCount);
        await eventContract.createEventTicket(1, "PaidTicket", "PTK");

        const tx = await eventContract.connect(attendee1).purchaseTicket(1, { value: ethers.utils.parseEther("1") });
        await tx.wait();

        const registered = await eventContract.hasRegistered(attendee1.address, 1);
        expect(registered).to.be.true;
    });

    it("Should confirm attendance", async function () {
        const title = "Tech Conference";
        const description = "Annual tech conference";
        const startDate = Math.floor(Date.now() / 1000) - 86400; // 1 day in the past
        const endDate = Math.floor(Date.now() / 1000) + 86400; // 1 day in the future
        const eventType = 0; // Free event
        const expectedGuestCount = 50;

        await eventContract.createEvent(title, description, startDate, endDate, eventType, expectedGuestCount);
        await eventContract.createEventTicket(1, "FreeTicket", "FTK");

        await eventContract.connect(attendee1).registerForEvent(1);
        await eventContract.connect(attendee1).confirmAttendance(1);

        const verifiedCount = (await eventContract.events(1))._verifiedGuestCount;
        expect(verifiedCount).to.equal(1);
    });
});