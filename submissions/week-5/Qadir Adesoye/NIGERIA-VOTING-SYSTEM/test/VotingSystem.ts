import { expect } from "chai";
import { ethers } from "hardhat";
import { VotingSystem } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("VotingSystem", function () {
  let votingSystem: VotingSystem;
  let owner: HardhatEthersSigner;
  let voter1: HardhatEthersSigner;
  let voter2: HardhatEthersSigner;
  let nonVoter: HardhatEthersSigner;

  const candidates = [1, 2, 3];
  let votingStart: number;
  let votingEnd: number;

  beforeEach(async function () {
    [owner, voter1, voter2, nonVoter] = await ethers.getSigners();
    
    const currentTime = await time.latest();
    votingStart = currentTime + 60;
    votingEnd = votingStart + 3600;
    
    const VotingSystem = await ethers.getContractFactory("VotingSystem");
    votingSystem = await VotingSystem.deploy(
      votingStart,
      votingEnd,
      candidates
    );
    await votingSystem.waitForDeployment();
  });

  describe("Deployment", function () {
    it("should deploy with correct initial parameters", async function () {
      expect(await votingSystem.votingStart()).to.equal(votingStart);
      expect(await votingSystem.votingEnd()).to.equal(votingEnd);
      expect(await votingSystem.resultsRevealed()).to.be.false;
      expect(await votingSystem.paused()).to.be.false;
      expect(await votingSystem.owner()).to.equal(owner.address);
    });

    it("should store candidates correctly", async function () {
      const storedCandidate = await votingSystem.candidates(0);
      expect(storedCandidate).to.equal(candidates[0]);
    });
  });

  describe("registerVoter", function () {
    it("should allow owner to register voters", async function () {
      await votingSystem.registerVoter(voter1.address);
      expect(await votingSystem.registeredVoters(voter1.address)).to.be.true;
    });

    it("should prevent non-owner from registering voters", async function () {
      await expect(
        votingSystem.connect(voter1).registerVoter(voter2.address)
      ).to.be.revertedWithCustomError(votingSystem, "OwnableUnauthorizedAccount")
        .withArgs(voter1.address);
    });

    it("should prevent registering same voter twice", async function () {
      await votingSystem.registerVoter(voter1.address);
      await expect(
        votingSystem.registerVoter(voter1.address)
      ).to.be.revertedWith("Voter already registered");
    });
  });

  describe("emergencyPause", function () {
    it("should allow owner to pause contract", async function () {
      await votingSystem.emergencyPause();
      expect(await votingSystem.paused()).to.be.true;
    });

    it("should prevent non-owner from pausing", async function () {
      await expect(
        votingSystem.connect(voter1).emergencyPause()
      ).to.be.revertedWithCustomError(votingSystem, "OwnableUnauthorizedAccount")
        .withArgs(voter1.address);
    });
  });

  describe("castVote", function () {
    it("should allow registered voters to cast votes", async function () {
      await votingSystem.registerVoter(voter1.address);
      await time.increaseTo(votingStart + 1);
      const voteHash = ethers.keccak256(ethers.toUtf8Bytes("1"));
      await votingSystem.connect(voter1).castVote(voteHash);
      expect(await votingSystem.hasVoted(voter1.address)).to.be.true;
    });

    it("should prevent unregistered voters from voting", async function () {
      await time.increaseTo(votingStart + 1);
      const voteHash = ethers.keccak256(ethers.toUtf8Bytes("1"));
      await expect(
        votingSystem.connect(nonVoter).castVote(voteHash)
      ).to.be.revertedWith("Not registered voter");
    });

    it("should prevent voting when paused", async function () {
      await votingSystem.registerVoter(voter1.address);
      await votingSystem.emergencyPause();
      await time.increaseTo(votingStart + 1);
      const voteHash = ethers.keccak256(ethers.toUtf8Bytes("1"));
      await expect(
        votingSystem.connect(voter1).castVote(voteHash)
      ).to.be.revertedWith("Contract is paused");
    });

    it("should prevent double voting", async function () {
      await votingSystem.registerVoter(voter1.address);
      await time.increaseTo(votingStart + 1);
      const voteHash = ethers.keccak256(ethers.toUtf8Bytes("1"));
      await votingSystem.connect(voter1).castVote(voteHash);
      await expect(
        votingSystem.connect(voter1).castVote(voteHash)
      ).to.be.revertedWith("Already voted");
    });
  });

  describe("revealResults", function () {
    it("should reveal results correctly", async function () {
      await votingSystem.registerVoter(voter1.address);
      await votingSystem.registerVoter(voter2.address);
      await time.increaseTo(votingStart + 1);
      
      await votingSystem.connect(voter1).castVote(
        ethers.keccak256(ethers.toUtf8Bytes("1"))
      );
      await votingSystem.connect(voter2).castVote(
        ethers.keccak256(ethers.toUtf8Bytes("2"))
      );
      
      await time.increaseTo(votingEnd + 1);
      await votingSystem.revealResults(
        [voter1.address, voter2.address],
        [1, 2]
      );
      
      const [candidateIds, results] = await votingSystem.getResults();
      expect(candidateIds[0]).to.equal(candidates[0]);
      expect(results[0]).to.equal(1); // Candidate 1
      expect(results[1]).to.equal(1); // Candidate 2
    });
  });

  describe("getVotingStats", function () {
    it("should return correct voting statistics", async function () {
      await votingSystem.registerVoter(voter1.address);
      await time.increaseTo(votingStart + 1);
      await votingSystem.connect(voter1).castVote(
        ethers.keccak256(ethers.toUtf8Bytes("1"))
      );
      
      const [totalVoters, totalVotes, startTime, endTime, resultsRevealed] = 
        await votingSystem.getVotingStats();
      
      expect(totalVoters).to.equal(1);
      expect(totalVotes).to.equal(1);
      expect(startTime).to.equal(votingStart);
      expect(endTime).to.equal(votingEnd);
      expect(resultsRevealed).to.be.false;
    });


    describe("verifyVote", function () {
        it("should verify valid vote", async function () {
          await votingSystem.registerVoter(voter1.address);
          await time.increaseTo(votingStart + 1);
          const voteHash = ethers.keccak256(ethers.toUtf8Bytes("1"));
          await votingSystem.connect(voter1).castVote(voteHash);
          expect(
            await votingSystem.verifyVote(voter1.address, voteHash)
          ).to.be.true;
        });
      
        it("should return false for invalid vote hash", async function () {
          await votingSystem.registerVoter(voter1.address);
          await time.increaseTo(votingStart + 1);
          const voteHash = ethers.keccak256(ethers.toUtf8Bytes("1"));
          const wrongHash = ethers.keccak256(ethers.toUtf8Bytes("2"));
          await votingSystem.connect(voter1).castVote(voteHash);
          expect(
            await votingSystem.verifyVote(voter1.address, wrongHash)
          ).to.be.false;
        });
      });
      
      describe("Edge Cases", function () {
        it("should not allow voting with zero hash", async function () {
          await votingSystem.registerVoter(voter1.address);
          await time.increaseTo(votingStart + 1);
          await expect(
            votingSystem.connect(voter1).castVote(ethers.ZeroHash)
          ).to.be.revertedWith("Invalid vote hash");
        });
      
        it("should not allow voting with hash already used", async function () {
          await votingSystem.registerVoter(voter1.address);
          await votingSystem.registerVoter(voter2.address);
          await time.increaseTo(votingStart + 1);
          
          const voteHash = ethers.keccak256(ethers.toUtf8Bytes("1"));
          await votingSystem.connect(voter1).castVote(voteHash);
          await expect(
            votingSystem.connect(voter2).castVote(voteHash)
          ).to.be.revertedWith("Vote hash already used");
        });
    
      
        it("should not reveal results if voter count exceeds total votes", async function () {
          await votingSystem.registerVoter(voter1.address);
          await time.increaseTo(votingStart + 1);
          await votingSystem.connect(voter1).castVote(
            ethers.keccak256(ethers.toUtf8Bytes("1"))
          );
          await time.increaseTo(votingEnd + 1);
          await expect(
            votingSystem.revealResults([voter1.address, voter2.address], [1, 2])
          ).to.be.revertedWith("Invalid voter count");
        });
      
        it("should not allow voting before start time", async function () {
          await votingSystem.registerVoter(voter1.address);
          const voteHash = ethers.keccak256(ethers.toUtf8Bytes("1"));
          await expect(
            votingSystem.connect(voter1).castVote(voteHash)
          ).to.be.revertedWith("Voting not started");
        });
      
        it("should not allow voting after end time", async function () {
          await votingSystem.registerVoter(voter1.address);
          await time.increaseTo(votingEnd + 1);
          const voteHash = ethers.keccak256(ethers.toUtf8Bytes("1"));
          await expect(
            votingSystem.connect(voter1).castVote(voteHash)
          ).to.be.revertedWith("Voting ended");
        });
      
        it("should not reveal results twice", async function () {
          await votingSystem.registerVoter(voter1.address);
          await time.increaseTo(votingStart + 1);
          await votingSystem.connect(voter1).castVote(
            ethers.keccak256(ethers.toUtf8Bytes("1"))
          );
          await time.increaseTo(votingEnd + 1);
          await votingSystem.revealResults([voter1.address], [1]);
          await expect(
            votingSystem.revealResults([voter1.address], [1])
          ).to.be.revertedWith("Results already revealed");
        });
      });





  });
});