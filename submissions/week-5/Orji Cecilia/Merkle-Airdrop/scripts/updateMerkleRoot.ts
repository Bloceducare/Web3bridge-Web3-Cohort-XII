import { ethers } from "hardhat";
import fs from "fs";

async function main() {
    const contractAddress = "0x8399fE96CfD4Cf997Fe121f740617a466974315d"; 
    
  const newMerkleRoot = JSON.parse(fs.readFileSync("scripts/merkleRoot.json", "utf-8")).merkleRoot;

  console.log(`🚀 Updating Merkle Root to: ${newMerkleRoot}...`);

  const airdrop = await ethers.getContractAt("MerkleAirdrop", contractAddress);
  const tx = await airdrop.updateMerkleRoot(newMerkleRoot);
  await tx.wait();

  console.log("✅ Merkle Root Updated Successfully!");
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
