import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import hre, { ethers } from "hardhat";
import { expect } from "chai";

describe("EventContract", () => {
    const deployEventContract = async () => {
         const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'
        const [owner, addr1, addr2] = await hre.ethers.getSigners();
        const EventContract = await hre.ethers.getContractFactory("EventContract");
        const eventContract = await EventContract.deploy();
        return { eventContract, owner, addr1, addr2, ADDRESS_ZERO };
    };

    describe('Deploy staking contract', () => {
        it('Should deploy my contract', async () => {
            let {eventContract, owner} = await loadFixture(deployEventContract);

            const runner = eventContract.runner as HardhatEthersSigner;

            expect(runner.address).to.be.equal(owner.address);
        })

        it('Should not be address zero', async () => {
            let {eventContract, ADDRESS_ZERO} = await loadFixture(deployEventContract);

            expect(eventContract.target).to.not.be.equal(ADDRESS_ZERO);
        })
    })

    describe("Event Creation", () => {
        it("Should create an event successfully", async () => {
            const { eventContract, owner } = await loadFixture(deployEventContract);
            await expect(
                eventContract.createEvent(
                    "Blockchain Conference",
                    "A conference about blockchain",
                    Math.floor(Date.now() / 1000) + 3600,
                    Math.floor(Date.now() / 1000) + 7200,
                    1,
                    100
                )
            ).to.emit(eventContract, "EventCreated").withArgs(1, owner.address);
        });

        it("Should fail if start date is in the past", async () => {
            const { eventContract } = await loadFixture(deployEventContract);
            await expect(
                eventContract.createEvent(
                    "Invalid Event",
                    "Test",
                    Math.floor(Date.now() / 1000) - 100,
                    Math.floor(Date.now() / 1000) + 7200,
                    1,
                    100
                )
            ).to.be.revertedWith("START DATE MUST BE IN FUTURE");
        });
    });

    describe("Event Registration", () => {
        it("Should allow user to register for a free event", async () => {
            const { eventContract, addr1 } = await loadFixture(deployEventContract);
            await eventContract.createEvent(
                "Free Event",
                "Test description",
                Math.floor(Date.now() / 1000) + 3600,
                Math.floor(Date.now() / 1000) + 7200,
                0,
                50
            );
            await expect(eventContract.connect(addr1).registerForEvent(1))
                .to.emit(eventContract, "EventRegistered")
                .withArgs(1, addr1.address, "data:image/svg+xml;base64,PHN2ZyB4b");
        });

        it("Should prevent duplicate registrations", async () => {
            const { eventContract, addr1 } = await loadFixture(deployEventContract);
            await eventContract.createEvent(
                "Unique Registration Event",
                "Test",
                Math.floor(Date.now() / 1000) + 3600,
                Math.floor(Date.now() / 1000) + 7200,
                0,
                50
            );
            await eventContract.connect(addr1).registerForEvent(1);
            await expect(eventContract.connect(addr1).registerForEvent(1))
                .to.be.revertedWith("ALREADY REGISTERED");
        });
    });
});