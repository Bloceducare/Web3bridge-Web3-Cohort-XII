import { ethers } from "hardhat";
import { MerkleTree } from "merkletreejs";
const keccak256 = require("keccak256");

async function main() {
  const [claimer] = await ethers.getSigners(); // Use first signer to claim
  const Airdrop = await ethers.getContractFactory("Airdrop");
  const Token = await ethers.getContractFactory("Token");

  // Deploy contracts (or replace with deployed addresses)
  const token = await Token.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();

  const addresses = [
    [claimer.address, ethers.parseUnits("0.1", 18)],
  ];

  // Compute Merkle Tree
  const leaves = addresses.map((addr) =>
    keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["address", "uint256"], addr))
  );
  const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  const root = "0x" + merkleTree.getRoot().toString("hex");

  // Deploy Airdrop contract
  const airdrop = await Airdrop.deploy(root, tokenAddress);
  await airdrop.waitForDeployment();
  const airdropAddress = await airdrop.getAddress();

  console.log(`Airdrop Contract deployed at: ${airdropAddress}`);
  console.log(`Token Contract deployed at: ${tokenAddress}`);

  // Get Merkle proof
  const leaf = keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(["address", "uint256"], addresses[0])
  );
  const proof = merkleTree.getProof(leaf).map((p) => "0x" + p.toString("hex"));

  console.log("Claiming airdrop...");
  const tx = await airdrop.connect(claimer).claim(proof, ethers.parseUnits("0.1", 18));
  await tx.wait();

  console.log(`Claim successful! ${claimer.address} received tokens.`);
}

main().catch((error) => {
  console.error("Error claiming tokens:", error);
  process.exitCode = 1;
});
