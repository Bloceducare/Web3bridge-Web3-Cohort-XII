import { ethers } from "hardhat";

async function main() {
  const contractAddress = "CONTRACT_ADDRESS"; 
  const eventContract = await ethers.getContractAt("EventContract", contractAddress);

  const tx = await eventContract.createEventTicket(
    1, // ID de l'événement
    "VIP Ticket",
    "VIP",
    "https://example.com/metadata/"
  );

  await tx.wait();
  console.log("Ticket NFT créé avec succès !");
}

main().catch(console.error);
