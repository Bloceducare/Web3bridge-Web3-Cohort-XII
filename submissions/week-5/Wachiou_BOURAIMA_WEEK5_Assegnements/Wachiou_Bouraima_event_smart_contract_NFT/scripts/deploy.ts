import { ethers } from "hardhat";



async function main() {

    const event = await ethers.deployContract("EventContract");

    await event.waitForDeployment();

    console.log(
        `eventContract contract successfully deployed to: ${event.target}`
    );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});