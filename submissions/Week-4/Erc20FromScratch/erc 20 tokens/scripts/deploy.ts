import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contract with account:", deployer.address);

    const Idealz = await ethers.getContractFactory("Idealz");
    const idealz = await Idealz.deploy();

    await idealz.waitForDeployment();

    console.log("Idealz deployed to:", await idealz.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});