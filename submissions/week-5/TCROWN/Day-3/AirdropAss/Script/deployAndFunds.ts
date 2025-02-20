import { ethers } from "hardhat";
import { MerkleTree } from "merkletreejs";
const keccak256 = require("keccak256");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with account: ${deployer.address}`);

  // Deploy Token contract
  const Token = await ethers.getContractFactory("IToken");
  const token = await Token.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log(`Token deployed at: ${tokenAddress}`);

  // Define airdrop recipients
  const recipients = [
    { address: "0x1111111111111111111111111111111111111111", amount: ethers.parseUnits("0.1", 18) },
    { address: "0x2222222222222222222222222222222222222222", amount: ethers.parseUnits("0.1", 18) },
    { address: "0x3333333333333333333333333333333333333333", amount: ethers.parseUnits("0.1", 18) },
    { address: "0x4444444444444444444444444444444444444444", amount: ethers.parseUnits("0.1", 18) },
  ];

  // Generate Merkle Tree
  const leaves = recipients.map(({ address, amount }) =>
    keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["address", "uint256"], [address, amount]))
  );
  const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  const root = "0x" + merkleTree.getRoot().toString("hex");

  // Deploy Airdrop contract
  const Airdrop = await ethers.getContractFactory("Airdrop");
  const airdrop = await Airdrop.deploy(root, tokenAddress);
  await airdrop.waitForDeployment();
  const airdropAddress = await airdrop.getAddress();
  console.log(`Airdrop deployed at: ${airdropAddress}`);

  // Fund Airdrop contract with tokens
  const totalTokens = ethers.parseUnits("0.4", 18); // 0.1 * 4 recipients
  const tx = await token.transfer(airdropAddress, totalTokens);
  await tx.wait();
  console.log(`Airdrop contract funded with ${totalTokens} tokens`);

  console.log(`Merkle Root: ${root}`);
  console.log("Airdrop setup complete!");
}

main().catch((error) => {
  console.error("Error deploying contracts:", error);
  process.exitCode = 1;
});
