import { ethers } from "hardhat";


  async function deploy() {
    const event = await ethers.deployContract("EventContract");

    await event.waitForDeployment();

    console.log("EventContract deployed to:", event.target);


  }


deploy().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});