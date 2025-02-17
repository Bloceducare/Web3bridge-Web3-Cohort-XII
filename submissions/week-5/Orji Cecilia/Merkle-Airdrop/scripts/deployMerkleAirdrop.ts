import { ethers } from "hardhat";
import fs from "fs";

async function main() {
  console.log("🚀 Deploying MerkleAirdrop...");

  // Load Merkle Root from JSON file
  const merkleData = JSON.parse(fs.readFileSync("scripts/merkleRoot.json", "utf-8"));
  const merkleRoot = merkleData.merkleRoot;

  // Ensure valid addresses before deployment
  const tokenAddress = "0x8399fE96CfD4Cf997Fe121f740617a466974315d";  
  const baycNFT = "0x2FFa5b9C97B0EE110a5Aa2D51F05058E1c855B03";

  if (!ethers.isAddress(tokenAddress) || !ethers.isAddress(baycNFT)) {
    throw new Error("❌ Invalid Token or BAYC NFT contract address.");
  }

  console.log(`🔹 Using Token Address: ${tokenAddress}`);
  console.log(`🔹 Using BAYC NFT Address: ${baycNFT}`);
  console.log(`🔹 Using Merkle Root: ${merkleRoot}`);

  // Deploy contract
  const MerkleAirdrop = await ethers.getContractFactory("MerkleAirdrop");
  const airdrop = await MerkleAirdrop.deploy(tokenAddress, merkleRoot, baycNFT);

  await airdrop.waitForDeployment();
  console.log(`✅ MerkleAirdrop deployed to: ${await airdrop.getAddress()}`);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exit(1);
});
