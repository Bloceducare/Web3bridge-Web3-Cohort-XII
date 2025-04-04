const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  // Replace this with your deployed EventContract address from deploy.js output
  const eventContractAddress = "0x036c1B9f90861110F04c6728C73C5755B68356B2"; 

  const eventContract = await hre.ethers.getContractAt(
    "EventContract",
    eventContractAddress
  );

  console.log("Creating event...");

  const tx = await eventContract.createEvent(
    "Blockchain Conference",
    "A premier event for blockchain enthusiasts.",
    Math.floor(Date.now() / 1000) + 86400, // Start date (1 day from now)
    Math.floor(Date.now() / 1000) + 172800, // End date (2 days from now)
    1, // EventType (0 = free, 1 = paid)
    100 // Expected Guest Count
  );

  await tx.wait();
  console.log("Event created successfully! ✅");
  console.log(tx);
  
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
