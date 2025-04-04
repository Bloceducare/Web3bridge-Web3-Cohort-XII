import { expect } from "chai";
import { ethers } from "hardhat";
import { Voting } from "../typechain-types";

describe("Voting", function () {
  let voting: Voting;
  let owner: any;
  let voter: any;

  beforeEach(async function () {
    [owner, voter] = await ethers.getSigners();

    const VotingFactory = await ethers.getContractFactory("Voting");
    voting = (await VotingFactory.deploy()) as Voting;
    await voting.deployed();
  });

  it("should create an election", async function () {
    const candidates = [
      { name: "Candidate A", ipfsHash: "QmHashA" },
      { name: "Candidate B", ipfsHash: "QmHashB" },
    ];

    await voting.createElection(
      "Test Election",
      "Nigeria",
      Math.floor(Date.now() / 1000),
      Math.floor(Date.now() / 1000) + 60,
      candidates.map((c) => [c.name, c.ipfsHash])
    );

    const [pollTitle, country, startTime, endTime, returnedCandidates] =
      await voting.getElection(1);

    expect(pollTitle).to.equal("Test Election");
    expect(country).to.equal("Nigeria");
    expect(returnedCandidates.length).to.equal(2);
    
    expect(returnedCandidates[0][0]).to.equal("Candidate A"); // Fix access to tuple
    expect(returnedCandidates[1][0]).to.equal("Candidate B");
  });

  it("should register a voter", async function () {
    await voting.connect(voter).registerVoter("Nigeria");

    const registeredCountry = await voting.voters(voter.address);
    expect(registeredCountry).to.equal("Nigeria");
  });

  it("should allow a voter to cast a vote", async function () {
    const candidates = [
      { name: "Candidate A", ipfsHash: "QmHashA" },
      { name: "Candidate B", ipfsHash: "QmHashB" },
    ];

    await voting.createElection(
      "Test Election",
      "Nigeria",
      Math.floor(Date.now() / 1000) - 10, // Start time in the past
      Math.floor(Date.now() / 1000) + 60, // End time in the future
      candidates.map((c) => [c.name, c.ipfsHash])
    );

    await voting.connect(voter).registerVoter("Nigeria");

    await voting.connect(voter).vote(1, "Candidate A");

    const candidateAVotes = await voting.getCandidateVotes(1, "Candidate A");
    const candidateBVotes = await voting.getCandidateVotes(1, "Candidate B");

    expect(candidateAVotes).to.equal(1);
    expect(candidateBVotes).to.equal(0);
  });

  it("should determine the winner of an election", async function () {
    const candidates = [
      { name: "Candidate A", ipfsHash: "QmHashA" },
      { name: "Candidate B", ipfsHash: "QmHashB" },
    ];

    await voting.createElection(
      "Test Election",
      "Nigeria",
      Math.floor(Date.now() / 1000) - 10, // Start time in the past
      Math.floor(Date.now() / 1000) + 60, // End time in the future
      candidates.map((c) => [c.name, c.ipfsHash])
    );

    await voting.connect(voter).registerVoter("Nigeria");

    await voting.connect(voter).vote(1, "Candidate A");

    const winner = await voting.getWinner(1);
    expect(winner).to.equal("Candidate A");
  });
});
