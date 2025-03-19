import { ethers } from 'hardhat';
import { MerkleTree } from 'merkletreejs';
import keccak256 from 'keccak256';
import {
  MerkleAirdrop__factory,
  MerkleAirdropToken__factory,
} from '../typechain-types'; 

async function main() {
  const tokenAddress = '0x4A1C3A9FA17FbFCDA5de9B93Ead34AcBb4Bd08D7'; 
  const airdropAddress = '0x5F340a1f33cFAd5AC2a79a99d89724D8157f0D2d';

  
  const claimerAddress = ''; 

  const provider = ethers.provider;
  const token = MerkleAirdropToken__factory.connect(tokenAddress, provider);
  const airdrop = MerkleAirdrop__factory.connect(airdropAddress, provider);

  const addresses = [
    '0x', 
    '0xAddress2', 
    claimerAddress, 
    
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
  console.log('4. Call the claim function with the following proof:');
  console.log(proof);
  console.log('5. Confirm the transaction in your wallet.');

  // Optional: Check if the claimer is eligible 
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