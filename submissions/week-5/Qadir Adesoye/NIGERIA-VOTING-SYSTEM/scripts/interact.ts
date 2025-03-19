import { ethers } from "hardhat";
import { log } from "console";
import { expect } from "chai"; // Assuming you're using Chai for assertions

async function main() {
  try {
    // Address where the VotingSystem contract was deployed
    const votingSystemAddress = "0x351692a28f6792C40aC621D241977c85C39E477a"; // Replace with your actual address

    // Get the first signer (the deployer's account)
    const [deployer] = await ethers.getSigners();

    // Define the interface for the VotingSystem contract
    interface VotingSystemContract extends ethers.Contract {
      registeredVoters: (address: string) => Promise<boolean>;
      registerVoter: (address: string) => Promise<ethers.ContractTransaction>;
      votingStart: () => Promise<bigint>;
      votingEnd: () => Promise<bigint>;
      hasVoted: (address: string) => Promise<boolean>;
      castVote: (voteHash: string) => Promise<ethers.ContractTransaction>;
      votes: (address: string) => Promise<{ voteHash: string; timestamp: number; verified: boolean }>;
      getResults: () => Promise<[number[], number[]]>;
      revealResults: (voters: string[], choices: number[]) => Promise<ethers.ContractTransaction>;
    }

    // Attach to the deployed contract with the correct interface
    const votingSystem = await ethers.getContractAt("VotingSystem", votingSystemAddress) as VotingSystemContract;

    log("\nTesting contract functionality...\n");

    // 1. Registering voters
    log("1. Registering voters...");
    try {
      const isVoterRegistered = await votingSystem.registeredVoters(deployer.address);
      if (!isVoterRegistered) {
        const tx = await votingSystem.registerVoter(deployer.address);
        const txReceipt = await tx.wait();
        log("Voter registered successfully.");
        log(`Transaction Hash: ${tx.hash}`);
        log(`Gas Used: ${txReceipt.gasUsed.toString()}`);
      } else {
        log("Voter is already registered.");
      }
    } catch (error) {
      log(`Error during voter registration: ${(error as Error).message}`);
    }

    // 2. Casting a vote
    log("\n2. Casting a vote...");
    try {
      const currentTime = Math.floor(Date.now() / 1000);
      const votingStart = await votingSystem.votingStart();
      const votingEnd = await votingSystem.votingEnd();
      
      if (currentTime < Number(votingStart)) {
        log("Voting hasn't started yet.");
      } else if (currentTime > Number(votingEnd)) {
        log("Voting has ended.");
      } else {
        const hasVoted = await votingSystem.hasVoted(deployer.address);
        if (!hasVoted) {
          const voteHash = ethers.keccak256(ethers.toUtf8Bytes("1")); // Voting for candidate 1
          const tx = await votingSystem.castVote(voteHash);
          const txReceipt = await tx.wait();
          log("Vote cast successfully.");
          log(`Transaction Hash: ${tx.hash}`);
          log(`Gas Used: ${txReceipt.gasUsed.toString()}`);

          // Test: Check if the vote is stored as a hash
          const storedVote = await votingSystem.votes(deployer.address);
          log(`Stored vote hash: ${storedVote.voteHash}`);
        } else {
          log("This voter has already voted.");
        }
      }
    } catch (error) {
      log(`Error during vote casting: ${(error as Error).message}`);
    }

    // 3. Test revealing results
    log("\n3. Testing result revelation...");
    try {
      const currentTime = Math.floor(Date.now() / 1000);
      const votingEnd = Number(await votingSystem.votingEnd());
      
      if (currentTime <= votingEnd) {
        log("Voting period hasn't ended yet. Waiting for real time to pass for result revelation.");
      } else {
        // Attempt to get results before revealing (should fail)
        await expect(votingSystem.getResults()).to.be.revertedWith("Results not revealed yet");

        // Reveal results - This should only be done if the voting has ended in real time
        await votingSystem.revealResults([deployer.address], [1]);
        
        // Now fetching results should work
        const [candidateIds, results] = await votingSystem.getResults();
        log(`Results after reveal: ${JSON.stringify(results)}`);
      }
    } catch (error) {
      log(`Error revealing or fetching results: ${(error as Error).message}`);
    }

    // 4. Test for no vote manipulation or duplicate voting
    log("\n4. Testing vote manipulation and duplicate voting...");
    try {
      const voteHash = ethers.keccak256(ethers.toUtf8Bytes("1"));
      // Attempt to vote again, should fail
      await expect(votingSystem.castVote(voteHash)).to.be.revertedWith("Already voted");

      // Test invalid vote hash
      const invalidHash = ethers.ZeroHash;
      await expect(votingSystem.castVote(invalidHash)).to.be.revertedWith("Invalid vote hash");

      // Test already used vote hash (this assumes the hash was used above)
      await expect(votingSystem.castVote(voteHash)).to.be.revertedWith("Vote hash already used");
    } catch (error) {
      log(`Error testing vote manipulation: ${(error as Error).message}`);
    }

  } catch (error) {
    log("\nError Interacting with Contract:");
    log("=========================");
    log(`Error: ${(error as Error).message}`);
    log("=========================");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});