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
    "Verification Election",
    "Nigeria",
    Math.floor(Date.now() / 1000) - 60, // Start time in the past
    Math.floor(Date.now() / 1000) - 10, // End time in the past
    candidates.map((c) => [c.name, c.ipfsHash])
  );

  const winner = await voting.getWinner(1);
  console.log("Election Winner:", winner);

  const [pollTitle, country, startTime, endTime, returnedCandidates, votes] =
    await voting.getElection(1);

  console.log("Election Details:");
  console.log("Poll Title:", pollTitle);
  console.log("Country:", country);
  console.log("Start Time:", new Date(startTime * 1000));
  console.log("End Time:", new Date(endTime * 1000));
  console.log("Candidates and Votes:");
  for (let i = 0; i < returnedCandidates.length; i++) {
    console.log(`${returnedCandidates[i].name}: ${votes[i]} votes`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });