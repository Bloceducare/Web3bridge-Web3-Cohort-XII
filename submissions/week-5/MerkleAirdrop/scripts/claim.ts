import { ethers } from 'hardhat';
import { MerkleTree } from 'merkletreejs';
import keccak256 from 'keccak256';
import {
  MerkleAirdrop__factory,
  MerkleAirdropToken__factory,
} from '../typechain-types'; // Adjust path as needed

async function main() {
  // Replace these with the deployed contract addresses
  const tokenAddress = '0x9eA60D286B4906a597A97cd16FEdDb0b4fba9330'; // Replace with actual address
  const airdropAddress = '0x6b462077828531E80A175e0317548eA44594878F'; // Replace with actual address

  // Replace with the claimer's address (user provides this)
  const claimerAddress = ''; // Replace with the user's address (e.g., from MetaMask)

  // Connect to the contracts using the default provider (no private key needed)
  const provider = ethers.provider;
  const token = MerkleAirdropToken__factory.connect(tokenAddress, provider);
  const airdrop = MerkleAirdrop__factory.connect(airdropAddress, provider);

  // Generate the same Merkle tree used during deployment
  // For demonstration, we use random addresses and include the claimer's address
  // In a real scenario, use the same addresses used during deployment
  const addresses = [
    '0x', // Replace with actual addresses from deployment
    '0xAddress2', // Replace with actual addresses from deployment
    claimerAddress, // Include the claimer's address
    // Add more addresses as needed
  ];
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