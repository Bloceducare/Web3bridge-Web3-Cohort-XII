import { ethers, network } from "hardhat";
import fs from "fs";
import path from "path";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const FILE_PATH = path.join(__dirname, "addressesByNetwork.json");

async function main() {
  const [admin, voter1, voter2] = await ethers.getSigners();
  const networkName = network.name;

  console.log(`Running on network: ${networkName}`);
  console.log("Deploying contracts with account:", admin.address);

  // Load or initialize already deployed addresses
  let addresses: Record<string, any> = {};
  if (fs.existsSync(FILE_PATH)) {
    addresses = JSON.parse(fs.readFileSync(FILE_PATH, "utf8"));
  }

  let votingNFTAddress;
  let electionAddress;

  // Check if contracts are already deployed
  if (addresses[networkName] && networkName !== "localhost" && networkName !== "hardhat") {
    console.log(`Contracts already deployed on ${networkName}:`, addresses[networkName]);
  } else {
    console.log("Deploying contracts...");

    // Deploy VotingNFT contract
    const VotingNFT = await ethers.getContractFactory("VotingNFT");
    const votingNFT = await VotingNFT.deploy("VOTE");
    await votingNFT.waitForDeployment();
    console.log("VotingNFT deployed to:", votingNFT.target);

    // Deploy Election contract
    const candidates = ["Alice", "Bob", "Charlie"];
    const block = await ethers.provider.getBlock("latest");
    const startTime = block!.timestamp + 5; // Starts in 5 seconds
    const endTime = startTime + 5; // Ends in start time plus 5 seconds

    const Election = await ethers.getContractFactory("Election");
    const election = await Election.deploy(votingNFT.target, admin.address, candidates, startTime, endTime);
    await election.waitForDeployment();
    console.log("Election deployed to:", election.target);

    // Save addresses
    addresses[networkName] = {
      votingNFT: votingNFT.target,
      election: election.target,
    };
    fs.writeFileSync(FILE_PATH, JSON.stringify(addresses, null, 2));
  }

  // Get contract instances
  votingNFTAddress = addresses[networkName].votingNFT;
  electionAddress = addresses[networkName].election;
  const election = await ethers.getContractAt("Election", electionAddress);
  const votingNFT = await ethers.getContractAt("VotingNFT", votingNFTAddress);

  // Register voters (mint NFT)
  console.log("Registering voters...");
  let tx = await votingNFT.connect(admin).mintNFT(voter1.address);
  await tx.wait();
  console.log(`Voter1 (${voter1.address}) registered.`);

  tx = await votingNFT.connect(admin).mintNFT(voter2.address);
  await tx.wait();
  console.log(`Voter2 (${voter2.address}) registered.`);

  // Wait for election to start
  console.log("Waiting for election to start...");
  await delay(5000);

  // Voters cast their votes
  console.log("Casting votes...");
  tx = await election.connect(voter1).vote(1, 0); // Voter1 votes for Alice
  await tx.wait();
  console.log(`Voter1 (${voter1.address}) voted.`);

  tx = await election.connect(voter2).vote(2, 1); // Voter2 votes for Bob
  await tx.wait();
  console.log(`Voter2 (${voter2.address}) voted.`);

  // Wait for election to end
  console.log("Waiting for election to end...");
  await delay(15000);

  // Fetch results
  console.log("Fetching election results...");
  const results = await election.getResults();
  console.log(`Final results: Alice(${results[0]}), Bob(${results[1]}), Charlie(${results[2]})`);
}

// Execute script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
