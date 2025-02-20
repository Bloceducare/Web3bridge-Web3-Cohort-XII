import { expect } from "chai";
import { ethers } from "hardhat";
import { Voting } from "../typechain-types";

describe("Additional Tests", function () {
  let voting: Voting;
  let owner: any;
  let voter: any;

  beforeEach(async function () {
    console.log("Deploying Voting contract...");
    [owner, voter] = await ethers.getSigners();
    const VotingFactory = await ethers.getContractFactory("Voting");
    voting = (await VotingFactory.deploy()) as Voting;
    await voting.deployed();
    console.log("Voting contract deployed at:", voting.address);
  });

  describe("Edge Case Testing", function () {
    it("should reject elections with invalid start/end times", async function () {
      const candidates = [{ name: "Candidate A", ipfsHash: "QmHashA" }];

      await expect(
        voting.createElection(
          "Invalid Election",
          "Nigeria",
          Math.floor(Date.now() / 1000) + 60, // Start time in the future
          Math.floor(Date.now() / 1000), // End time in the past
          candidates.map((c) => [c.name, c.ipfsHash])
        )
      ).to.be.revertedWith("Start time must be before end time");
    });
  });

  describe("Duplicate Candidates Testing", function () {
    it("should reject elections with duplicate candidate names", async function () {
      const candidates = [
        { name: "Candidate A", ipfsHash: "QmHashA" },
        { name: "Candidate A", ipfsHash: "QmHashB" }, // Duplicate name
      ];

      await expect(
        voting.createElection(
          "Duplicate Candidates Election",
          "Nigeria",
          Math.floor(Date.now() / 1000),
          Math.floor(Date.now() / 1000) + 60,
          candidates.map((c) => [c.name, c.ipfsHash])
        )
      ).to.be.revertedWith("Duplicate candidate names are not allowed");
    });
  });

  describe("Security Testing", function () {
    it("should restrict election creation to the contract owner", async function () {
      const candidates = [{ name: "Candidate A", ipfsHash: "QmHashA" }];

      await expect(
        voting.connect(voter).createElection(
          "Unauthorized Election",
          "Nigeria",
          Math.floor(Date.now() / 1000),
          Math.floor(Date.now() / 1000) + 60,
          candidates.map((c) => [c.name, c.ipfsHash])
        )
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Time-Based Testing", function () {
    it("should reject votes before the election starts", async function () {
      const candidates = [{ name: "Candidate A", ipfsHash: "QmHashA" }];

      await voting.createElection(
        "Time Test",
        "Nigeria",
        Math.floor(Date.now() / 1000) + 60, // Start time in the future
        Math.floor(Date.now() / 1000) + 120, // End time in the future
        candidates.map((c) => [c.name, c.ipfsHash])
      );

      await voting.connect(voter).registerVoter("Nigeria");

      await expect(
        voting.connect(voter).vote(1, "Candidate A")
      ).to.be.revertedWith("Voting is not open");
    });
  });
});