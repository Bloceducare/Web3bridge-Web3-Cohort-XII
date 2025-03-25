import { ethers } from "hardhat";

async function main() {
  // Deploy Token
  const Token = await ethers.getContractFactory("AirdropToken");
  const token = await Token.deploy();
  await token.deployed();
  console.log("Token deployed to:", token.address);

  // Deploy Airdrop
  const Airdrop = await ethers.getContractFactory("MerkleAirdrop");
  const airdrop = await Airdrop.deploy(token.address);
  await airdrop.deployed();
  console.log("Airdrop deployed to:", airdrop.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
