import { ethers } from "hardhat";

async function main(): any {
  const event = await ethers.deployContract("Event");

  await event.waitForDeployment();

  console.log({
    "Event contract contract successfully deployed to": event.target,
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error: any) => {
  console.error(error);
  process.exitCode = 1;
});
