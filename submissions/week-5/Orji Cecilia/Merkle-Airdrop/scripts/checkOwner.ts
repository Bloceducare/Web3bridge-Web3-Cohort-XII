import { ethers } from "hardhat";

async function main() {
  const contractAddress = "0xB048c7b3dC1673ae2807073a2Db06C836C374071"; // Your contract address
  const airdrop = await ethers.getContractAt("MerkleAirdrop", contractAddress);

  console.log("📜 Airdrop Contract Address:", contractAddress);
  console.log("👑 Contract Owner:", await airdrop.owner());
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
