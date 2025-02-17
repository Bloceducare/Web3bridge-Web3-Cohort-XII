const hre = require("hardhat");

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const Ballot = await hre.ethers.deployContract("Ballot");

  await Ballot.waitForDeployment();

  console.log(`Contract deployed to ${Ballot.target}`);

  // Sleep for 45 seconds
  await sleep(45000);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});