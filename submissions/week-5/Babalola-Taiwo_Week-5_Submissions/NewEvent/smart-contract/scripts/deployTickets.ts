const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    try {
        console.log("Deploying Tickets contract...");

        // Deploy Tickets contract
        const TicketsFactory = await ethers.getContractFactory("Tickets");
        const tickets = await TicketsFactory.deploy();
        await tickets.waitForDeployment();

        console.log(`Tickets contract deployed at: ${await tickets.getAddress()}`);
    } catch (error) {
        console.error("Deployment failed:", error);
        process.exitCode = 1;
    }
}

// Run the deployment script
main();
