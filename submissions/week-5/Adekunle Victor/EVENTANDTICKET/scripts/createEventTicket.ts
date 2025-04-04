import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  const eventContractAddress = "0x036c1B9f90861110F04c6728C73C5755B68356B2";

  console.log(`Creating ticket for event ID: 4...`);

  // ✅ Fix: Use hre.ethers.getContractAt correctly
  const eventContract = await hre.ethers.getContractAt(
    "EventContract",
    eventContractAddress,
    deployer
  );

  const ticketPrice = hre.ethers.parseEther("0.05"); // Fix parseEther

  const tx = await eventContract.createEventTicket(
    4,
    "Blockchain Ticket",
    "BCT",
    ticketPrice,
    2,
    deployer.address
  );

  await tx.wait();
  console.log("✅ Ticket contract deployed successfully!");
  console.log(tx.blockHash);
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
