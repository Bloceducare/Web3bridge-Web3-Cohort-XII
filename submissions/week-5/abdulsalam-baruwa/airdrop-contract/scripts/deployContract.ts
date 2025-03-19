import { ethers } from "hardhat";


async function deployContract() {

    const airdrop = await ethers.deployContract("Airdrop", ["0xD86ec216b7A8a333dc93D9BdcA44c09a417CFC11"]);

    await airdrop.waitForDeployment();

    console.log("Airdrop Contract deployed to:", airdrop.target);
}


deployContract().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});