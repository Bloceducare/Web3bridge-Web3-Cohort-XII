import { ethers } from "hardhat";

async function main(network: string) {
  const VotingFactory = await ethers.getContractFactory("Voting");
  const voting = await VotingFactory.deploy();
  await voting.deployed();

  console.log(`Voting contract deployed to ${network}:`, voting.address);
}

const networks = ["goerli", "sepolia"];

networks.forEach(async (network) => {
  try {
    await main(network);
  } catch (error) {
    console.error(`Failed to deploy to ${network}:`, error);
  }
});