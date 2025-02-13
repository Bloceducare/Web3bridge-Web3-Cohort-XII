const { ethers } = require("hardhat");

async function main() {
    const Event = await ethers.getContractFactory("Event");


    const eventContract = await Event.deploy();

    await eventContract.waitForDeployment();
    console.log("Event deployed to:", eventContract.target);

    const title = "Sample Event";
    const description = "This is a sample event.";
    const startDate = (await ethers.provider.getBlock("latest")).timestamp + 1000;
    const endDate = startDate + 10000;
    const eventType = 1;
    const expectedGuestCount = 100;
    const tokenURI = "https://ticket.com/jjj";

    
    const tx = await eventContract.createEvent(
        title,
        description,
        startDate,
        endDate,
        eventType,
        expectedGuestCount,
        tokenURI,
        2
    );

    await tx.wait();
    console.log("Event created successfully");


    
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

    // npx hardhat run scripts/interact.js --network 