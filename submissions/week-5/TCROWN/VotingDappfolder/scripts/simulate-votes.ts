import { ethers } from "hardhat";

async function main() {
  const VotingFactory = await ethers.getContractFactory("Voting");
  const voting = await VotingFactory.deploy();
  await voting.deployed();

  const candidates = [
    { name: "Candidate A", ipfsHash: "QmHashA" },
    { name: "Candidate B", ipfsHash: "QmHashB" },
  ];

  await voting.createElection(
    "Simulated Election",
    "Nigeria",
    Math.floor(Date.now() / 1000) - 60, // Start time in the past
    Math.floor(Date.now() / 1000) + 60, // End time in the future
    candidates.map((c) => [c.name, c.ipfsHash])
  );

  const signers = await ethers.getSigners();

  for (let i = 0; i < signers.length; i++) {
    const voter = signers[i];
    await voting.connect(voter).registerVoter("Nigeria");
    await voting.connect(voter).vote(1, i % 2 === 0 ? "Candidate A" : "Candidate B");
  }

  console.log("Votes cast successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });