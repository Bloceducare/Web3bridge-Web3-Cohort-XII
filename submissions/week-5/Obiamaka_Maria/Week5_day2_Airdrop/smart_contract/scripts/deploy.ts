import { ethers } from "hardhat";
import * as fs from "fs";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contract with account: ${deployer.address}`);

  const merkleData = JSON.parse(fs.readFileSync("merkleData.json", "utf8"));
  const merkleRoot = merkleData.merkleRoot;
  const tokenAddress = "0x295d07155cc738e05f52db11fA12F290d4f0c65D"; // Replace with actual ERC20 token address

  if (!tokenAddress || !merkleRoot) {
    console.error("Invalid token address or merkle root");
    return;
  }

  const MerkleAirdrop = await ethers.deployContract("MerkleAirdrop", [tokenAddress, merkleRoot]);
  try {
    // Deploy the contract
    //const contract = await MerkleAirdrop.deploy(tokenAddress, merkleRoot);

    // Wait for deployment to complete (this also ensures the contract has been mined)
    //await contract.deployed();
    const receipt = await MerkleAirdrop.waitForDeployment();

    console.log(`MerkleAirdrop deployed at: ${MerkleAirdrop.target}`);
    
    // If you need to get the transaction receipt
    //const receipt = await contract.deployTransaction.wait();
    console.log('Transaction receipt:', receipt); // Log the transaction receipt

  } catch (error) {
    console.error('Error deploying contract:', error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
