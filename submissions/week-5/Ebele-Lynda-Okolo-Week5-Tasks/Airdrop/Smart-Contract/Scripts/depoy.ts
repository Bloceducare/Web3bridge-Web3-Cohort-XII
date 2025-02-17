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
  // Get the deployer (signer)
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

  // Include the deployer's address in the Merkle tree
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

  // Transfer tokens to the airdrop contract (e.g., 10 ETH worth of tokens)
  const transferAmount = ethers.parseEther('10');
  await token.transfer(airdrop.target, transferAmount);
  console.log(`Transferred ${ethers.formatEther(transferAmount)} tokens to airdrop contract`);

  // Log the deployer's proof for claiming (for demonstration)
  const proof = merkleTree.getHexProof(keccak256(deployer.address));
  console.log('Deployer proof:', proof);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });