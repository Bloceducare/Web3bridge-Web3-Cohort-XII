import { ethers } from 'hardhat';
import { MerkleTree } from 'merkletreejs';
import keccak256 from 'keccak256';
import { Wallet } from 'ethers';
import { randomBytes } from 'crypto';
import {
  MerkleAirdrop__factory,
  MerkleAirdropToken__factory,
} from '../typechain-types'; // Adjust path as needed

async function main() {
  // Get the claimer (signer)
  const [claimer] = await ethers.getSigners();
  console.log('Interacting with account:', claimer.address);

  // Replace these with the deployed contract addresses
  const tokenAddress = '0x9eA60D286B4906a597A97cd16FEdDb0b4fba9330'; // Replace with actual address
  const airdropAddress = '0x6b462077828531E80A175e0317548eA44594878F'; // Replace with actual address

  // Connect to the contracts
  const token = MerkleAirdropToken__factory.connect(tokenAddress, claimer);
  const airdrop = MerkleAirdrop__factory.connect(airdropAddress, claimer);

  // Generate the same Merkle tree used during deployment
  // For demonstration, we use random addresses and include the claimer's address
  // In a real scenario, use the same addresses used during deployment
  const randomAddresses = Array.from({ length: 15 }, () =>
    new Wallet(randomBytes(32).toString('hex')).address
  );
  const addresses = [...randomAddresses, claimer.address];
  const merkleTree = new MerkleTree(
    addresses,
    keccak256,
    { hashLeaves: true, sortPairs: true }
  );

  // Get the proof for the claimer
  const proof = merkleTree.getHexProof(keccak256(claimer.address));
  console.log('Claimer proof:', proof);

  // Check if the claimer is eligible
  const canClaim = await airdrop.canClaim(claimer.address, proof);
  console.log('Can claim:', canClaim);

  if (!canClaim) {
    console.log('Claimer is not eligible or has already claimed.');
    return;
  }

  // Check the claimer's token balance before claiming
  const balanceBefore = await token.balanceOf(claimer.address);
  console.log('Token balance before claim:', ethers.formatEther(balanceBefore));

  // Claim tokens
  console.log('Claiming tokens...');
  const claimTx = await airdrop.claim(proof);
  await claimTx.wait();
  console.log('Claim successful!');

  // Check the claimer's token balance after claiming
  const balanceAfter = await token.balanceOf(claimer.address);
  console.log('Token balance after claim:', ethers.formatEther(balanceAfter));

  // Verify the claimed status
  const hasClaimed = await airdrop.claimed(claimer.address);
  console.log('Has claimed:', hasClaimed);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });