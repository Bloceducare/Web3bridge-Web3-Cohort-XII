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
  // Get the deployer and additional signers (for claiming)
  const [deployer, claimer1, claimer2] = await ethers.getSigners();
  console.log('Deploying contracts with account:', deployer.address);

  // Deploy the token contract
  const tokenFactory = new MerkleAirdropToken__factory(deployer);
  const token = await tokenFactory.deploy();
  await token.waitForDeployment();
  console.log('MerkleAirdropToken deployed to:', token.target);

  // Generate random addresses and include claimers
  const randomAddresses = Array.from({ length: 13 }, () =>
    new Wallet(randomBytes(32).toString('hex')).address
  );
  const addresses = [...randomAddresses, claimer1.address, claimer2.address];

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

  // Claim tokens for claimer1
  console.log('\n=== Claiming for Claimer 1 ===');
  const proof1 = merkleTree.getHexProof(keccak256(claimer1.address));
  console.log('Claimer 1 proof:', proof1);

  const canClaim1 = await airdrop.canClaim(claimer1.address, proof1);
  console.log('Claimer 1 can claim:', canClaim1);

  if (canClaim1) {
    const balanceBefore1 = await token.balanceOf(claimer1.address);
    console.log('Claimer 1 balance before:', ethers.formatEther(balanceBefore1));

    const claimTx1 = await airdrop.connect(claimer1).claim(proof1);
    await claimTx1.wait();
    console.log('Claimer 1 claim successful!');

    const balanceAfter1 = await token.balanceOf(claimer1.address);
    console.log('Claimer 1 balance after:', ethers.formatEther(balanceAfter1));
  }

  // Claim tokens for claimer2
  console.log('\n=== Claiming for Claimer 2 ===');
  const proof2 = merkleTree.getHexProof(keccak256(claimer2.address));
  console.log('Claimer 2 proof:', proof2);

  const canClaim2 = await airdrop.canClaim(claimer2.address, proof2);
  console.log('Claimer 2 can claim:', canClaim2);

  if (canClaim2) {
    const balanceBefore2 = await token.balanceOf(claimer2.address);
    console.log('Claimer 2 balance before:', ethers.formatEther(balanceBefore2));

    const claimTx2 = await airdrop.connect(claimer2).claim(proof2);
    await claimTx2.wait();
    console.log('Claimer 2 claim successful!');

    const balanceAfter2 = await token.balanceOf(claimer2.address);
    console.log('Claimer 2 balance after:', ethers.formatEther(balanceAfter2));
  }

  // Attempt to claim again for claimer1 (should fail)
  console.log('\n=== Attempting to claim again for Claimer 1 ===');
  const hasClaimed1 = await airdrop.claimed(claimer1.address);
  console.log('Claimer 1 has claimed:', hasClaimed1);

  try {
    await airdrop.connect(claimer1).claim(proof1);
  } catch (error) {
    console.log('Claimer 1 cannot claim again (as expected).');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });