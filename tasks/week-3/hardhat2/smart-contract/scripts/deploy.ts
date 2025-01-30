import { ethers, run } from "hardhat";

async function main() {
  // Compile the contract before deployment
  await run('compile');

  // Get contract factory
  const Ballot = await ethers.getContractFactory("Ballot");

  // Set up the parameters for the initialize function
  const proposals: string[] = [
    ethers.encodeBytes32String("Proposal1"),
    ethers.encodeBytes32String("Proposal2")
  ];
  // Deploy the contract to Sepolia Testnet
  console.log("Deploying Ballot contract to Sepolia...");
  const ballotSepolia = await Ballot.deploy(proposals);
  await ballotSepolia.waitForDeployment();
  console.log(`Ballot contract deployed to Sepolia at ${await ballotSepolia.getAddress()}`);

  // Remove initialization as proposals are now passed in constructor
  console.log("Ballot contract initialized on Sepolia");
  console.log("Ballot contract initialized on Sepolia");

  // Deploy the contract to Polygon Mumbai Testnet
  // Deploy the contract to Polygon Mumbai Testnet
  console.log("Deploying Ballot contract to Polygon Mumbai...");
  const ballotMumbai = await Ballot.deploy(proposals);
  await ballotMumbai.waitForDeployment();
  console.log(`Ballot contract deployed to Polygon Mumbai at ${await ballotMumbai.getAddress()}`);

  // Remove initialization as proposals are now passed in constructor
  console.log("Ballot contract initialized on Polygon Mumbai");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
