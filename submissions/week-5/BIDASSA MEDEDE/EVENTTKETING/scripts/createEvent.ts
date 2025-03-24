import { ethers } from "hardhat";

async function main() {
  const contractAddress = "0x3e54352811793CBe12951a04ED102c26fEF4d1B1"; 
  const eventContract = await ethers.getContractAt("EventContract", contractAddress);

  const tx = await eventContract.createEvent(
    "Blockchain Summit",
    "Un événement pour les passionnés de blockchain",
    Math.floor(Date.now() / 1000) + 3600, // 1h dans le futur
    Math.floor(Date.now() / 1000) + 86400, // Dure 24h
    1, // Paid event
    100 // Nombre d'invités
  );

  await tx.wait();
  console.log(" Événement créé avec succès !");
}

main().catch((error) => {
  console.error("Erreur lors de la création de l'événement :", error);
  process.exitCode = 1;
});
