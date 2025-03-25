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
  // Get the deployer
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with account:', deployer.address);

  // Deploy the token contract
  const tokenFactory = new MerkleAirdropToken__factory(deployer);
  const token = await tokenFactory.deploy();
  await token.waitForDeployment();
  console.log('MerkleAirdropToken deployed to:', token.target);

  // Generate random addresses for the Merkle tree (for demonstration)
  const randomAddresses = Array.from({ length: 15 }, () =>
    new Wallet(randomBytes(32).toString('hex')).address
  );
  const addresses = [...randomAddresses, deployer.address];

  // Create the Merkle tree
  const merkleTree = new MerkleTree(
    addresses,
    keccak256,
    { hashLeaves: true, sortPairs: true }
  );
  const root = merkleTree.getHexRoot();
  console.log('Merkle root:', root);

  // Deploy the airdrop contract
  const airdropFactory = new MerkleAirdrop__factory(deployer);
  const airdrop = await airdropFactory.deploy(token.target, root);
  await airdrop.waitForDeployment();
  console.log('MerkleAirdrop deployed to:', airdrop.target);

  // Transfer tokens to the airdrop contract
  const transferAmount = ethers.parseEther('10');
  await token.transfer(airdrop.target, transferAmount);
  console.log(`Transferred ${ethers.formatEther(transferAmount)} tokens to airdrop contract`);

  // Generate proof for deployer (for demonstration)
  const proof = merkleTree.getHexProof(keccak256(deployer.address));
  console.log('Deployer proof:', proof);

  // Instructions for claiming
  console.log('\n=== Instructions for Claiming Airdrop ===');
  console.log('1. Connect to the network (e.g., Base Sepolia) using your wallet (e.g., MetaMask).');
  console.log('2. Ensure your wallet address is:', deployer.address);
  console.log('3. Go to the airdrop contract at:', airdrop.target);
  console.log('4. Call the `claim` function with the following proof:');
  console.log(proof);
  console.log('5. Confirm the transaction in your wallet.');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });