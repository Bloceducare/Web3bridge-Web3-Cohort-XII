import { expect } from "chai";
import hre from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("EventContract", function () {
    async function deployEventContractFixture() {
        const EventContract = await hre.ethers.getContractFactory("EventContract");
        const [owner, user1, user2] = await hre.ethers.getSigners();
        const eventContract = await EventContract.deploy();

        return { eventContract, owner, user1, user2 };
    }

    describe("Deployment", function () {
        it("Should deploy successfully", async function () {
            const { eventContract } = await loadFixture(deployEventContractFixture);
            expect(eventContract.target).to.be.properAddress;
        });
    });



    describe("Creating Events", function () {
        it("Should allow the owner to create an event", async function () {
            const eventTitle = "Tech Conference";
            const eventDesc = "A conference about technology";
            const availableTikets = 50;
            const startTime = (await time.latest()) + 604800;
            const endTime = startTime + 86400;
            const eventType = 0;




            const { eventContract, owner } = await loadFixture(deployEventContractFixture);
            await eventContract.createEvent(eventTitle, eventDesc, startTime, endTime, eventType, availableTikets);
            const event = await eventContract.events(1);
            expect(event._title).to.equal("Tech Conference");
            expect(event._expectedGuestCount).to.equal(50);
        });
    });

    describe("Buying Tickets", function () {
        it("Should allow users to buy tickets", async function () {
            const eventTitle = "Tech Conference";
            const eventDesc = "A conference about technology";
            const availableTikets = 50;
            const startTime = (await time.latest()) + 604800;
            const endTime = startTime + 86400;
            const eventType = 0;
            const { eventContract, user1 } = await loadFixture(deployEventContractFixture);
            await eventContract.createEvent(eventTitle, eventDesc, startTime, endTime, eventType, availableTikets);
            await eventContract.createEventTicket(1, eventTitle, "TC")
            await eventContract.connect(user1).registerForEvent(1);
            const ticketCount = await eventContract.event_count();
            expect(ticketCount).to.equal(1);
        });

        it("Should not allow buying more tickets more than 1", async function () {
            const eventTitle = "Tech Conference";
            const eventDesc = "A conference about technology";
            const availableTikets = 20;
            const startTime = (await time.latest()) + 604800;
            const endTime = startTime + 86400;
            const eventType = 0;
            const { eventContract, user1, user2 } = await loadFixture(deployEventContractFixture);
            await eventContract.createEvent(eventTitle, eventDesc, startTime, endTime, eventType, availableTikets);
            await eventContract.createEventTicket(1, eventTitle, "TC")
            await eventContract.connect(user1).registerForEvent(1);
            await expect(eventContract.connect(user1).registerForEvent(1))
                .to.be.revertedWith("ALREADY REGISTERED");
        });
        it("it should create an eve,t ticket for the user", async function () {
            const eventTitle = "Tech Conference";
            const eventDesc = "A conference about technology";
            const availableTikets = 1;
            const startTime = (await time.latest()) + 604800;
            const endTime = startTime + 86400;
            const eventType = 0;
            const { eventContract, user1, user2 } = await loadFixture(deployEventContractFixture);
            await eventContract.createEvent(eventTitle, eventDesc, startTime, endTime, eventType, availableTikets);
            await eventContract.createEventTicket(1, eventTitle, "TC" )
   
        })
        it("Should not allow buying more tickets than available", async function () {
            const eventTitle = "Tech Conference";
            const eventDesc = "A conference about technology";
            const availableTikets = 1;
            const startTime = (await time.latest()) + 604800;
            const endTime = startTime + 86400;
            const eventType = 0;
            const { eventContract, user1, user2 } = await loadFixture(deployEventContractFixture);
            await eventContract.createEvent(eventTitle, eventDesc, startTime, endTime, eventType, availableTikets);
            await eventContract.createEventTicket(1, eventTitle, "TC")
            await eventContract.connect(user1).registerForEvent(1);
            

            await expect(eventContract.connect(user2).registerForEvent(1))
                .to.be.revertedWith("REGISTRATION CLOSED");
        });
        it("Should not allow buying tickets for an event that does not exist", async function () {
            const { eventContract, user1 } = await loadFixture(deployEventContractFixture);
            await expect(eventContract.connect(user1).registerForEvent(1))
                .to.be.revertedWith("EVENT DOESNT EXIST");
        });
        it("it should purchase a ticket for the user", async function () {
            const eventTitle = "Tech Conference";
            const eventDesc = "A conference about technology";
            const availableTikets = 50;
            const startTime = (await time.latest()) + 604800;
            const endTime = startTime + 86400;
            const eventType = 0;
            const { eventContract, owner, user1 } = await loadFixture(deployEventContractFixture);
            await eventContract.createEvent(eventTitle, eventDesc, startTime, endTime, eventType, availableTikets);
            await eventContract.createEvent(eventTitle, eventDesc, startTime, endTime, eventType, availableTikets);
            await eventContract.createEventTicket(1, eventTitle, "TC")
            // const ticketId = await eventContract.connect(user1).purchaseTicket(1, user1.address);
            await eventContract.connect(user1).purchaseTicket(1, user1.address);
                        
        });
    })
})