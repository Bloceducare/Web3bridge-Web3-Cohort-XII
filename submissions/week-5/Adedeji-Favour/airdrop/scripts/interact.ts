import { ethers } from "hardhat";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";
require("dotenv").config();

// const keccak256 = require('keccak256');
// const { MerkleTree } = require('merkletreejs');
async function main() {
  const users = [
      { address: "0xFABB0ac9d68B0B445fB7357272Ff202C5651694a", amount: 1000 },
      { address: "0x71bE63f3384f5fb98995898A86B02Fb2426c5788", amount: 2000 },
      { address: "0xBcd4042DE499D14e55001CcbB24a551F3b954096", amount: 1500 }
  ];
  
  const leaves = users.map(user => keccak256(user.address + user.amount));
  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  
  const merkleRoot = tree.getRoot().toString('hex');
  console.log("Merkle Root:", merkleRoot);

  const userAddress = "0x9A73414365f5D77Fe1D4aA2Ae67a7b5FA3eb01eA"
  const amount = 100
  
  const provider = new ethers.JsonRpcProvider(process.env.LISK_RPC);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  
  const airdropContractAddress = "0x45fd27a3b78125ef572b8858168dA715A6d53306"; 
  const airdropContract = await ethers.getContractAt("Airdrop", airdropContractAddress, wallet);
  
  await airdropContract.setMerkleRoot(merkleRoot);

  const proof = tree.getHexProof(keccak256(userAddress + amount));

  await airdropContract.claim(amount, proof);
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})