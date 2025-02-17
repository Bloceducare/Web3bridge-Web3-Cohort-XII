import { ethers } from "hardhat";

async function main() {
  const eventContractAddress = "0xB2CB5D1E5D918447130Ac36ba653fA7d3e2Ac4e5";
  const eventContract = await ethers.getContractAt("EventContract", eventContractAddress);

  console.log("Confirming attendee at the event...");
  const tx = await eventContract.confirmAttendee(1, 1);
  await tx.wait();
  console.log(tx);
  
  console.log("Attendee successfully confirmed!");
}

main().catch((error) => {
  console.error("Confirmation failed:", error);
  process.exitCode = 1;
});
