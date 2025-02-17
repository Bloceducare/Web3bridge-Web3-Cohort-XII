import { ethers } from "hardhat";

async function main() {
  const contractAddress = "0x113b37AF6Ac66FAbcC0d5b0CA2A85D938A422aCF"; // Replace with your contract address
  const airdrop = await ethers.getContractAt("MerkleAirdrop", contractAddress);

  console.log("📜 Airdrop Contract Address:", contractAddress);
  console.log("👑 Contract Owner:", await airdrop.owner());

  const storedMerkleRoot = await airdrop.merkleRoot();
  console.log("🌳 Stored Merkle Root in Contract:", storedMerkleRoot);
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
