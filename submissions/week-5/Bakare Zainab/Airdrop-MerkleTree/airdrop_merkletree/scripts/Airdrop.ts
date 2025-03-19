import { ethers } from "hardhat";
import { generateMerkleTree } from "./generatemerkle";

async function main() {
  // Deploy token
  const AirdropToken = await ethers.getContractFactory("AirdropToken");
  const token = await AirdropToken.deploy();
  await token.waitForDeployment();
  console.log("Token deployed to:", await token.getAddress());

  // Deploy airdrop contract
  const AirdropMerkle = await ethers.getContractFactory("AirdropMerkle");
  const airdrop = await AirdropMerkle.deploy(await token.getAddress());
  await airdrop.waitForDeployment();
  console.log("Airdrop deployed to:", await airdrop.getAddress());

  // Example whitelist
  const whitelist = [
    {
      address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      amount: ethers.parseUnits("0.0000001", 18).toString()
    },
    {
      address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      amount: ethers.parseUnits("0.0000001", 18).toString()
    }
  ];

  // Generate Merkle tree
  const { root, proofs } = generateMerkleTree(whitelist);

  // Prepare initialization data
  const addresses = whitelist.map(w => w.address);
  const amounts = whitelist.map(w => w.amount);

  // Transfer tokens to airdrop contract
  const totalAmount = whitelist.reduce(
    (sum, w) => sum + BigInt(w.amount),
    BigInt(0)
  );
  await token.transfer(await airdrop.getAddress(), totalAmount);
  console.log("Transferred tokens to airdrop contract");

  // Initialize airdrop
  await airdrop.initializeAirdrop(root, addresses, amounts);
  console.log("Airdrop initialized with Merkle root:", root);

  // Log proofs for testing
  console.log("Proofs:", proofs);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});