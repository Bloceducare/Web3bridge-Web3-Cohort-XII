import {
    time,
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";
import { EventContract } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("EventContract", function () {
    // Fixture that deploys the contract
    async function deployEventContractFixture() {
        const [owner, otherAccount] = await hre.ethers.getSigners();
        
        const EventContract = await hre.ethers.getContractFactory("EventContract");
        const eventContract = await EventContract.deploy();

        return { eventContract, owner, otherAccount };
    }

    describe("Event Creation", function () {
        it("Should create a free event successfully", async function () {
            const { eventContract, owner } = await loadFixture(deployEventContractFixture);
            
            const currentTime = await time.latest();
            const startDate = currentTime + 86400; // 1 day from now
            const endDate = startDate + 86400;     // 2 days from now

            await eventContract.createEvent(
                "Free Event",
                "A test free event",
                startDate,
                endDate,
                0, // EventType.free
                100, // expected guest count
                0 // ticket price (free)
            );

            const event = await eventContract.events(1);
            expect(event._title).to.equal("Free Event");
            expect(event._type).to.equal(0);
            expect(event._organizer).to.equal(owner.address);
        });

        it("Should create a paid event successfully", async function () {
            const { eventContract } = await loadFixture(deployEventContractFixture);
            
            const currentTime = await time.latest();
            const startDate = currentTime + 86400;
            const endDate = startDate + 86400;
            const ticketPrice = hre.ethers.parseEther("0.1");

            await eventContract.createEvent(
                "Paid Event",
                "A test paid event",
                startDate,
                endDate,
                1, // EventType.paid
                100,
                ticketPrice
            );

            const event = await eventContract.events(1);
            expect(event._title).to.equal("Paid Event");
            expect(event._type).to.equal(1);
            expect(event._ticketPrice).to.equal(ticketPrice);
        });

        it("Should fail if start date is in the past", async function () {
            const { eventContract } = await loadFixture(deployEventContractFixture);
            
            const currentTime = await time.latest();
            const startDate = currentTime - 86400; // 1 day ago
            const endDate = currentTime + 86400;

            await expect(eventContract.createEvent(
                "Failed Event",
                "This should fail",
                startDate,
                endDate,
                0,
                100,
                0
            )).to.be.revertedWith("Start Date must be in the Future");
        });
    });

    describe("Event Registration", function () {
        it("Should allow registration for free event", async function () {
            const { eventContract, otherAccount } = await loadFixture(deployEventContractFixture);
            
            const currentTime = await time.latest();
            const startDate = currentTime + 86400;
            const endDate = startDate + 86400;

            await eventContract.createEvent(
                "Free Event",
                "A test free event",
                startDate,
                endDate,
                0,
                100,
                0
            );

            await eventContract.connect(otherAccount).registerForEvent(1);
            
            const event = await eventContract.events(1);
            expect(event._registeredGuestCount).to.equal(1);
            expect(await eventContract.hasRegistered(otherAccount.address, 1)).to.be.true;
        });

        it("Should allow registration for paid event with correct payment", async function () {
            const { eventContract, otherAccount } = await loadFixture(deployEventContractFixture);
            
            const currentTime = await time.latest();
            const startDate = currentTime + 86400;
            const endDate = startDate + 86400;
            const ticketPrice = hre.ethers.parseEther("0.1");

            await eventContract.createEvent(
                "Paid Event",
                "A test paid event",
                startDate,
                endDate,
                1,
                100,
                ticketPrice
            );

            await eventContract.connect(otherAccount).registerForEvent(1, {
                value: ticketPrice
            });
            
            const event = await eventContract.events(1);
            expect(event._registeredGuestCount).to.equal(1);
        });

        it("Should fail registration with incorrect payment", async function () {
            const { eventContract, otherAccount } = await loadFixture(deployEventContractFixture);
            
            const currentTime = await time.latest();
            const startDate = currentTime + 86400;
            const endDate = startDate + 86400;
            const ticketPrice = hre.ethers.parseEther("0.1");

            await eventContract.createEvent(
                "Paid Event",
                "A test paid event",
                startDate,
                endDate,
                1,
                100,
                ticketPrice
            );

            await expect(eventContract.connect(otherAccount).registerForEvent(1, {
                value: hre.ethers.parseEther("0.05")
            })).to.be.revertedWith("Incorrect Ether sent");
        });
    });

    describe("NFT Tickets", function () {
        it("Should create NFT ticket contract", async function () {
            const { eventContract, owner } = await loadFixture(deployEventContractFixture);
            
            const currentTime = await time.latest();
            const startDate = currentTime + 86400;
            const endDate = startDate + 86400;

            await eventContract.createEvent(
                "Event with NFT",
                "Test event with NFT tickets",
                startDate,
                endDate,
                0,
                100,
                0
            );

            await eventContract.createEventTicket(1, "Test Ticket", "TKT");
            
            const event = await eventContract.events(1);
            expect(event._ticketAddress).to.not.equal(hre.ethers.ZeroAddress);
        });

        it("Should mint NFT ticket on registration", async function () {
            const { eventContract, owner, otherAccount } = await loadFixture(deployEventContractFixture);
            
            const currentTime = await time.latest();
            const startDate = currentTime + 86400;
            const endDate = startDate + 86400;

            await eventContract.createEvent(
                "Event with NFT",
                "Test event with NFT tickets",
                startDate,
                endDate,
                0,
                100,
                0
            );

            await eventContract.createEventTicket(1, "Test Ticket", "TKT");
            
            await eventContract.connect(otherAccount).registerForEvent(1);
            
            const event = await eventContract.events(1);
            const ticketContract = await hre.ethers.getContractAt("Tickets", event._ticketAddress);
            expect(await ticketContract.balanceOf(otherAccount.address)).to.equal(1);
        });
    });

    describe("Attendance Confirmation", function () {
        it("Should confirm attendee with valid ticket", async function () {
            const { eventContract, owner, otherAccount } = await loadFixture(deployEventContractFixture);
            
            const currentTime = await time.latest();
            const startDate = currentTime + 86400;
            const endDate = startDate + 86400;

            await eventContract.createEvent(
                "Event with NFT",
                "Test event with NFT tickets",
                startDate,
                endDate,
                0,
                100,
                0
            );

            await eventContract.createEventTicket(1, "Test Ticket", "TKT");
            await eventContract.connect(otherAccount).registerForEvent(1);
            
            await eventContract.confirmAttendee(1, 0); // First ticket ID is 0
            
            const event = await eventContract.events(1);
            expect(event._verifiedGuestCount).to.equal(1);
            expect(await eventContract.isAttendeeConfirmed(1, otherAccount.address)).to.be.true;
        });

        it("Should fail confirmation for non-organizer", async function () {
            const { eventContract, owner, otherAccount } = await loadFixture(deployEventContractFixture);
            
            const currentTime = await time.latest();
            const startDate = currentTime + 86400;
            const endDate = startDate + 86400;

            await eventContract.createEvent(
                "Event with NFT",
                "Test event with NFT tickets",
                startDate,
                endDate,
                0,
                100,
                0
            );

            await eventContract.createEventTicket(1, "Test Ticket", "TKT");
            await eventContract.connect(otherAccount).registerForEvent(1);
            
            await expect(eventContract.connect(otherAccount).confirmAttendee(1, 0))
                .to.be.revertedWith("Only organizer can confirm attendees");
        });
    });
});