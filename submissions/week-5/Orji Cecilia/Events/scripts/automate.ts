import { ethers } from "hardhat";

async function main() {
    console.log("🚀 Starting Full Event Lifecycle Automation...");

    const [deployer] = await ethers.getSigners();
    console.log(`🔹 Deployer Address: ${deployer.address}`);

    // Deploy EventFactory
    console.log("🔹 Deploying EventFactory...");
    const EventFactory = await ethers.getContractFactory("EventFactory");
    const eventFactory = await EventFactory.deploy();
    await eventFactory.waitForDeployment();
    console.log(`✅ EventFactory deployed at: ${await eventFactory.getAddress()}`);

    // Create EventContract via Factory
    console.log("🔹 Creating EventContract...");
    const nonce = await ethers.provider.getTransactionCount(deployer.address, "pending");
    const tx1 = await eventFactory.createEventContract({ nonce });
    await tx1.wait();

    const deployedEvents = await eventFactory.getDeployedEvents();
    const eventContractAddress = deployedEvents[deployedEvents.length - 1];
    console.log(`✅ EventContract deployed at: ${eventContractAddress}`);

    const eventContract = await ethers.getContractAt("EventContract", eventContractAddress);

    // Create an Event
    console.log("🔹 Creating an Event...");
    const createEventTx = await eventContract.createEvent(
        "Blockchain Summit",
        "An exclusive blockchain event",
        Math.floor(Date.now() / 1000) + 86400, // Start date (1 day ahead)
        Math.floor(Date.now() / 1000) + 172800, // End date (2 days ahead)
        1, // Paid Event
        100, // Expected Guests
        ethers.parseEther("0.01") // Ticket Price (0.01 ETH)
    );
    await createEventTx.wait();
    console.log("✅ Event Created!");

    // Create Tickets for the Event
    console.log("🔹 Creating Tickets...");
    const createTicketTx = await eventContract.createEventTicket(1, "BlockchainPass", "BCP");
    await createTicketTx.wait();
    console.log("✅ Event Tickets Created!");

    // Buy a Ticket
    console.log("🔹 Purchasing Ticket...");
    const purchaseTicketTx = await eventContract.purchaseTicket(1, {
        value: ethers.parseEther("0.01"),
    });
    await purchaseTicketTx.wait();
    console.log("✅ Ticket Purchased & NFT Minted!");

    // Verify Attendance
    console.log("🔹 Verifying Attendance...");
    const verifyTx = await eventContract.verifyAttendance(1, deployer.address);
    await verifyTx.wait();
    console.log("✅ Attendance Verified!");

    // Withdraw Funds
    console.log("🔹 Withdrawing Funds...");
    const withdrawTx = await eventContract.withdrawFunds();
    await withdrawTx.wait();
    console.log("✅ Funds Withdrawn Successfully!");

    console.log("\n🎯 **Event Automation Complete!**");
    console.log(`📜 EventFactory: ${await eventFactory.getAddress()}`);
    console.log(`🎟 EventContract: ${eventContractAddress}`);
}

main().catch((error) => {
    console.error("❌ Automation failed:", error);
    process.exit(1);
});
