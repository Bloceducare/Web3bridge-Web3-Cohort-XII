import { ethers } from "hardhat";

async function main() {

  const ourPiggyBank = await ethers.deployContract("OurPiggyBank");

  await ourPiggyBank.waitForDeployment();

  console.log(
    `ourPiggyBankContract contract successfully deployed to: ${ourPiggyBank.target}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});