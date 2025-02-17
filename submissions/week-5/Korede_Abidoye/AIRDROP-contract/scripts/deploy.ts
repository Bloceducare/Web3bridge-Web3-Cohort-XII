import { ethers } from "hardhat";
import { generateMerkleTree } from "./generateMerkle";

async function main() {
  // Deploy token
  const AirdropToken = await ethers.getContractFactory("AirdropToken");
  const token = await AirdropToken.deploy();
  await token.waitForDeployment();
  console.log("Token deployed to:", await token.getAddress());

  // Define whitelist
  const whitelist = [
    {
      address: "0xA7CD28a9E07b32600686089ff2FC3BEdb564c2D9",
      amount: ethers.parseUnits("10", 18).toString()
    },
    // Add more addresses as needed
  ];

  // Generate Merkle tree
  const { root, proofs } = generateMerkleTree(whitelist);
  console.log("Merkle root:", root);

  // Prepare constructor arguments
  const addresses = whitelist.map(w => w.address);
  const amounts = whitelist.map(w => w.amount);

  // Deploy airdrop contract with all constructor arguments
  const AirdropMerkle = await ethers.getContractFactory("AirdropMerkle");
  const airdrop = await AirdropMerkle.deploy(
    await token.getAddress(), // _token
    root,                    // _merkleRoot
    addresses,               // addresses
    amounts                  // amounts
  );
  await airdrop.waitForDeployment();
  console.log("Airdrop deployed to:", await airdrop.getAddress());

  // Transfer tokens to airdrop contract
  const totalAmount = whitelist.reduce(
    (sum, w) => sum + BigInt(w.amount),
    BigInt(0)
  );
  await token.transfer(await airdrop.getAddress(), totalAmount);
  console.log("Transferred tokens to airdrop contract");

  // Log proofs for testing
  console.log("Proofs:", proofs);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});