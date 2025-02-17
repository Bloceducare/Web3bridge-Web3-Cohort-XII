import { ethers } from "hardhat";

async function main() {
  // Add your deployed contract addresses here
  const cisTokenAddress = "0xB048c7b3dC1673ae2807073a2Db06C836C374071"; 
  const baycNFTAddress = "0x904Fbc0D42C69db0253ba74599EFBecB4171227a"; 
  const airdropAddress = "0x3E8372217FDB1Bc0eefC29f3566D36a33813b0B2"; 

  console.log("📜 **Deployed Contract Addresses**");
  console.log("🔹 CisToken Contract: ", cisTokenAddress);
  console.log("🔹 BAYC NFT Contract: ", baycNFTAddress);
  console.log("🔹 Airdrop Contract: ", airdropAddress);

  // Fetch details for validation
  const airdrop = await ethers.getContractAt("MerkleAirdrop", airdropAddress);
  console.log("👑 Contract Owner: ", await airdrop.owner());
  console.log("🌳 Merkle Root: ", await airdrop.merkleRoot());
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
