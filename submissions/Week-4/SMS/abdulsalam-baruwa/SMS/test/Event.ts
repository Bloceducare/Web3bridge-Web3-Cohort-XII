import {
    time,
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { assert } from "console";
import hre from "hardhat";
import { expect } from "chai";

describe('Event test', () => {

    const deployEventContract = async () => {

        const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'

        const [owner, account1, account2, account3] = await hre.ethers.getSigners();

        const event = await hre.ethers.getContractFactory("EventContract");

        const deployEvent = await event.deploy();

        return { deployEvent, owner, account1, ADDRESS_ZERO }
    }

    describe("Deployment", () => {

        it('should be deployed by owner', async () => {
            let { deployEvent, owner } = await loadFixture(deployEventContract);

            const runner = deployEvent.runner as HardhatEthersSigner;

            expect(runner.address).to.equal(owner.address);
        })

        it('should not be address zero', async () => {
            let { deployEvent, ADDRESS_ZERO } = await loadFixture(deployEventContract);

            expect(deployEvent.target).to.not.be.equal(ADDRESS_ZERO);
        })
    })

    describe('Create Event', () => {

        it('should create an event', async () => {

            const latestTime = await time.latest();

            let { deployEvent } = await loadFixture(deployEventContract);

            let eventCountBeforeDeployment = await deployEvent.event_count();

            let e = await deployEvent.createEvent('poolparty', 'come with your baddie', latestTime + 90, BigInt(latestTime + 86400), 0, 20);

            let eventCountAfterDeployment = await deployEvent.event_count();

            console.log(e)
            expect(eventCountAfterDeployment).to.be.greaterThan(eventCountBeforeDeployment);

        })
    })
    describe('Register for Event', () => {

        it('should register for an event', async () => {

            const latestTime = await time.latest();

            let { deployEvent, account1 } = await loadFixture(deployEventContract);

            let e = await deployEvent.createEvent('poolparty', 'come with your baddie', latestTime + 90, BigInt(latestTime + 86400), 0, 20);

            let eventCountBeforeRegistration = await deployEvent.event_count();

            let register = await deployEvent.registerForEvent(0, 2);

            let eventCountAfterRegistration = await deployEvent.event_count();

            console.log(register)
            expect(eventCountAfterRegistration).to.be.equal(eventCountBeforeRegistration);
        })
    })

})