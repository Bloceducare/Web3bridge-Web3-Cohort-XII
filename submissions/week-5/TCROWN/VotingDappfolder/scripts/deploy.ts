import { ethers } from "hardhat";

async function main() {
  const VotingFactory = await ethers.getContractFactory("Voting");
  const voting = await VotingFactory.deploy();

  await voting.deployed();

  console.log("Voting contract deployed to:", voting.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });