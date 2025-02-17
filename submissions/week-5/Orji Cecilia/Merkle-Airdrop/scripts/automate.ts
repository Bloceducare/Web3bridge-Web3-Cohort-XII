import { ethers } from "hardhat";
import fs from "fs";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";

async function main() {
  console.log("🚀 Starting Full Deployment...");

  // 1️⃣ Deploy CisToken
  console.log("🔹 Deploying CisToken...");
  const CisToken = await ethers.getContractFactory("CisToken");
  const token = await CisToken.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log(`✅ CisToken deployed at: ${tokenAddress}`);

  // 2️⃣ Deploy BAYCNFT
  console.log("🔹 Deploying BAYCNFT...");
  const BAYCNFT = await ethers.getContractFactory("BAYCNFT");
  const baycNFT = await BAYCNFT.deploy("Bored Ape Yacht Club", "BAYC", "https://ipfs.io/ipfs/YOUR_CID/");
  await baycNFT.waitForDeployment();
  const baycNFTAddress = await baycNFT.getAddress();
  console.log(`✅ BAYCNFT deployed at: ${baycNFTAddress}`);

  // 3️⃣ Generate Merkle Root
  console.log("🔹 Generating Merkle Root...");
  const whitelist: Record<string, number> = JSON.parse(fs.readFileSync("scripts/whitelist.json", "utf-8"));

  const leaves = Object.entries(whitelist).map(([address, amount]) =>
    keccak256(Buffer.from(address + amount.toString()))
  );
  const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  const merkleRoot = merkleTree.getHexRoot();
  fs.writeFileSync("scripts/merkleRoot.json", JSON.stringify({ merkleRoot }));
  console.log(`✅ Merkle Root Generated: ${merkleRoot}`);

  // 4️⃣ Deploy Merkle Airdrop Contract
  console.log("🔹 Deploying Merkle Airdrop Contract...");
  const MerkleAirdrop = await ethers.getContractFactory("MerkleAirdrop");
  const airdrop = await MerkleAirdrop.deploy(tokenAddress, merkleRoot, baycNFTAddress);
  await airdrop.waitForDeployment();
  const airdropAddress = await airdrop.getAddress();
  console.log(`✅ Merkle Airdrop deployed at: ${airdropAddress}`);

  // 5️⃣ Update Merkle Root (if needed)
  console.log("🔹 Checking if Merkle Root needs an update...");
  const currentMerkleRoot = await airdrop.merkleRoot();
  if (currentMerkleRoot !== merkleRoot) {
    console.log("🔹 Updating Merkle Root in Contract...");
    const tx = await airdrop.updateMerkleRoot(merkleRoot);
    await tx.wait();
    console.log("✅ Merkle Root Updated Successfully!");
  } else {
    console.log("🔹 Merkle Root is already up to date. Skipping update.");
  }

  // ✅ Final Log
  console.log("\n🎯 **Deployment Complete!**");
  console.log(`📜 CisToken: ${tokenAddress}`);
  console.log(`🦍 BAYCNFT: ${baycNFTAddress}`);
  console.log(`🌳 Merkle Root: ${merkleRoot}`);
  console.log(`🎁 Airdrop Contract: ${airdropAddress}`);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exit(1);
});
