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
  // Replace these with the deployed contract addresses
  const tokenAddress = 'YOUR_TOKEN_ADDRESS'; // Replace with actual address
  const airdropAddress = 'YOUR_AIRDROP_ADDRESS'; // Replace with actual address

  // Replace with the claimer's address (user provides this)
  const claimerAddress = ''; // Replace with the user's address (e.g., from MetaMask)

  // Connect to the contracts using the default provider (no private key needed)
  const provider = ethers.provider;
  const token = MerkleAirdropToken__factory.connect(tokenAddress, provider);
  const airdrop = MerkleAirdrop__factory.connect(airdropAddress, provider);

  // Generate the same Merkle tree used during deployment (for demonstration)
  const randomAddresses = Array.from({ length: 15 }, () =>
    new Wallet(randomBytes(32).toString('hex')).address
  );
  const addresses = [...randomAddresses, claimerAddress];
  const merkleTree = new MerkleTree(
    addresses,
    keccak256,
    { hashLeaves: true, sortPairs: true }
  );

  // Get the proof for the claimer
  const proof = merkleTree.getHexProof(keccak256(claimerAddress));
  console.log('Claimer proof:', proof);

  // Instructions for the user
  console.log('\n=== Instructions for Claiming Airdrop ===');
  console.log('1. Connect to the network (e.g., Base Sepolia) using your wallet (e.g., MetaMask).');
  console.log('2. Ensure your wallet address is:', claimerAddress);
  console.log('3. Go to the airdrop contract at:', airdropAddress);
  console.log('4. Call the `claim` function with the following proof:');
  console.log(proof);
  console.log('5. Confirm the transaction in your wallet.');

  // Optional: Check if the claimer is eligible (read-only)
  const canClaim = await airdrop.canClaim(claimerAddress, proof);
  console.log('Can claim:', canClaim);

  if (!canClaim) {
    console.log('Claimer is not eligible or has already claimed.');
    return;
  }

  console.log('Please follow the instructions above to claim your airdrop.');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });