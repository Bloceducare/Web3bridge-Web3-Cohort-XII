import { ethers } from "hardhat";

async function main() {
  const eventContractAddress = "0xB2CB5D1E5D918447130Ac36ba653fA7d3e2Ac4e5";
  const eventContract = await ethers.getContractAt("EventContract", eventContractAddress);

  console.log("Registering for the event & purchasing ticket...");
  const tx = await eventContract.registerForEvent(2, {
    value: ethers.parseEther("0.05"), // Sending ETH for a paid event
  });

  await tx.wait();
  console.log(tx);
}

main().catch((error) => {
  console.error("Registration failed:", error);
  process.exitCode = 1;
});
