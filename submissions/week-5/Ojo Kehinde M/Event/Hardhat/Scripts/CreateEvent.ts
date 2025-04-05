import { ethers } from "hardhat";

async function main() {
  const eventContractAddress = "0xB2CB5D1E5D918447130Ac36ba653fA7d3e2Ac4e5";
  const signer = (await ethers.getSigners())[0]; // Get deployer's signer

  // Instead of using ethers.getContractAt, use Contract factory
  const eventContract = new ethers.Contract(
    eventContractAddress,
    (await ethers.getContractFactory("EventContract")).interface,
    signer
  );

  console.log("Creating a new event...");
  const tx = await eventContract.createEvent(
    "Blockchain Summit",
    "A premier event for blockchain enthusiasts",
    Math.floor(Date.now() / 1000) + 86400, // Start in 1 day
    Math.floor(Date.now() / 1000) + 172800, // Ends in 2 days
    1, // Paid event (0 = Free, 1 = Paid)
    100, // Expected Guests
    ethers.parseEther("0.05") // Ticket Price (0.05 ETH)
  );

  await tx.wait();
  console.log(tx);
}

main().catch((error) => {
  console.error("Failed to create event:", error);
  process.exitCode = 1;
});
