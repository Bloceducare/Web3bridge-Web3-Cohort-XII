const hre = require("hardhat");
import { ethers } from "hardhat";
async function main() {
  // Replace with your token address and Merkle Root
  const tokenAddress = "0x42a53C3Ce6cBf795ba5252b9817FE58f4c984365"; // Replace with your ERC20 token address
  const dropAmount = ethers.parseEther("100"); // 100 tokens
  const merkleRoot = "0x6e0e95ac9df0ad0879809429c5752be97efd146514a89259ce4f3759e3ff07b8"; // Replace with your Merkle Root

  // Deploy the contract
  const Airdrop = await hre.ethers.getContractFactory("AkpoloAirdrop");
  const airdrop = await Airdrop.deploy(tokenAddress, dropAmount, merkleRoot);

  // await airdrop.deployed();

  console.log("AkpoloAirdrop deployed to:", airdrop.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});