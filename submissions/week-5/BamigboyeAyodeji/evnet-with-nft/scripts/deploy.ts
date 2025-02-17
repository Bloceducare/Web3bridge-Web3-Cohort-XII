import { ethers } from "hardhat";

async function main() {

  const event = await ethers.deployContract("EventContract");

  await event.waitForDeployment();

  console.log("eventContract contract successfully deployed to: ${event.target");
}
