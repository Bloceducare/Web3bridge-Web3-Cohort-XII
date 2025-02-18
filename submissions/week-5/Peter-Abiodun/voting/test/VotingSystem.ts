import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Decentralized Voting System", function () {
    async function deployContracts() {
        const [admin, voter1, voter2, voter3] = await ethers.getSigners();

        // Deploy VotingNFT contract
        const VotingNFT = await ethers.getContractFactory("VotingNFT");
        const votingNFT = await VotingNFT.deploy("VOTE");
        await votingNFT.waitForDeployment();

        // Election details
        const candidates = ["Alice", "Bob", "Charlie"];
        const startTime = (await time.latest()) + 60; // Starts in 1 minute
        const endTime = startTime + 600; // Ends in 10 minutes

        // Deploy Election contract
        const Election = await ethers.getContractFactory("Election");
        const election = await Election.deploy(
            await votingNFT.getAddress(),
            admin.address,
            candidates,
            startTime,
            endTime
        );
        await election.waitForDeployment();

        return { votingNFT, election, admin, voter1, voter2, voter3, candidates, startTime, endTime };
    }

    describe("Registration & NFT Minting", function () {
        it("Should allow users to register and receive an NFT", async function () {
            const { votingNFT, admin, voter1 } = await loadFixture(deployContracts);
            await votingNFT.connect(admin).mintNFT(voter1.address);

            expect(await votingNFT.balanceOf(voter1.address)).to.equal(1);
            expect(await votingNFT.ownerOf(1)).to.equal(voter1.address);
        });

        it("Should prevent duplicate NFT minting for the same user", async function () {
            const { votingNFT, admin, voter1 } = await loadFixture(deployContracts);
            await votingNFT.connect(admin).mintNFT(voter1.address);
            await expect(votingNFT.connect(admin).mintNFT(voter1.address)).to.be.revertedWith("Voter already has an NFT for this election");
        });
    });

    describe("Voting", function () {
        it("Should allow users with an NFT to vote", async function () {
            const { votingNFT, election, admin, voter1 } = await loadFixture(deployContracts);
            await votingNFT.connect(admin).mintNFT(voter1.address);

            await time.increaseTo((await election.startTime())); // Move time forward to start election

            await expect(election.connect(voter1).vote(1, 0))
                .to.emit(election, "VoteCasted")
                .withArgs(voter1.address, 1, 0);

            expect(await election.hasVoted(voter1.address)).to.be.true;
        });

        it("Should prevent voting before election starts", async function () {
            const { votingNFT, election, admin, voter1 } = await loadFixture(deployContracts);
            await votingNFT.connect(admin).mintNFT(voter1.address);

            await expect(election.connect(voter1).vote(1, 0)).to.be.revertedWith("Election has not started");
        });

        it("Should prevent voting after election ends", async function () {
            const { votingNFT, election, admin, voter1, endTime } = await loadFixture(deployContracts);
            await votingNFT.connect(admin).mintNFT(voter1.address);

            await time.increaseTo(endTime + 1); // Move past election end time

            await expect(election.connect(voter1).vote(1, 0)).to.be.revertedWith("Election has ended");
        });

        it("Should prevent users without an NFT from voting", async function () {
            const { election, voter2 } = await loadFixture(deployContracts);
            await time.increaseTo((await election.startTime()));

            await expect(election.connect(voter2).vote(1, 0)).to.be.reverted;
        });

        it("Should prevent double voting", async function () {
            const { votingNFT, election, admin, voter1 } = await loadFixture(deployContracts);
            await votingNFT.connect(admin).mintNFT(voter1.address);

            await time.increaseTo((await election.startTime()));

            await election.connect(voter1).vote(1, 0);
            await expect(election.connect(voter1).vote(1, 1)).to.be.revertedWith("Already voted");
        });
    });

    describe("Results", function () {
        it("Should allow anyone to view results after election ends", async function () {
            const { votingNFT, election, admin, voter1, voter2, voter3, endTime } = await loadFixture(deployContracts);
            
            await votingNFT.connect(admin).mintNFT(voter1.address);
            await votingNFT.connect(admin).mintNFT(voter2.address);
            await votingNFT.connect(admin).mintNFT(voter3.address);

            await time.increaseTo((await election.startTime()));

            await election.connect(voter1).vote(1, 0);
            await election.connect(voter2).vote(2, 1);
            await election.connect(voter3).vote(3, 1);

            await time.increaseTo(endTime + 1); // Move past election end time

            const results = await election.getResults();
            expect(results[0]).to.equal(1); // Alice: 1 vote
            expect(results[1]).to.equal(2); // Bob: 2 votes
            expect(results[2]).to.equal(0); // Charlie: 0 votes
        });

        it("Should prevent accessing results before election ends", async function () {
            const { election } = await loadFixture(deployContracts);
            await expect(election.getResults()).to.be.revertedWith("Election is still active");
        });
    });
});
