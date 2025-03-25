const hre = require("hardhat");

async function main() {

    const Event = await hre.ethers.getContractFactory("Event");
    const event = await Event.deploy();


    await event.waitForDeployment();

    const address = await event.getAddress()


    console.log(
        `deployed to Event address ${address.toString()}}`
    );
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});