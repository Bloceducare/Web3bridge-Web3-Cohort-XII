import { expect } from 'chai';
import { randomBytes } from 'crypto';
import { Wallet } from 'ethers';
import { ethers } from 'hardhat';
import keccak256 from 'keccak256';
import { MerkleTree } from 'merkletreejs';

import {
  MerkleAirdrop__factory,
  MerkleAirdropToken__factory
} from '../typechain-types'; // Adjust path as needed

describe('Merkle Airdrop', function () {
  it('Full Cycle', async function () {
    // Note: Private keys are used here for testing purposes only.
    // In production, users should claim airdrops using their own wallets (e.g., MetaMask)
    // with a Merkle proof, and private keys should not be handled in scripts.
    const [signer, guy] = await ethers.getSigners();

    // Deploy the token contract
    const tokenFactory = new MerkleAirdropToken__factory(signer);
    const token = await tokenFactory.deploy();
    await token.waitForDeployment();

    const randomAddresses = Array.from({ length: 15 }, () =>
      new Wallet(randomBytes(32).toString('hex')).address
    );

    const merkleTree = new MerkleTree(
      [...randomAddresses, signer.address],
      keccak256,
      { hashLeaves: true, sortPairs: true }
    );

    const root = merkleTree.getHexRoot();

    // Deploy the airdrop contract
    const airdropFactory = new MerkleAirdrop__factory(signer);
    const airdrop = await airdropFactory.deploy(token.target, root);
    await airdrop.waitForDeployment();
    console.log('Airdrop address:', airdrop.target); 

    await token.transfer(airdrop.target, ethers.parseEther('10'));

    const proof = merkleTree.getHexProof(keccak256(signer.address));

    expect(await airdrop.claimed(signer.address)).to.be.false;

    expect(await airdrop.canClaim(signer.address, proof)).to.be.true;

    await expect(() =>
      airdrop.claim(proof)
    ).to.changeTokenBalances(token, [airdrop, signer], [
      ethers.parseEther('-1'),
      ethers.parseEther('1')
    ]);

    expect(await airdrop.claimed(signer.address)).to.be.true;
    expect(await airdrop.canClaim(signer.address, proof)).to.be.false;

    await expect(airdrop.claim(proof)).to.be.revertedWith(
      'MerkleAirdrop: Address is not a candidate for claim'
    );

    expect(await airdrop.claimed(guy.address)).to.be.false;
    expect(await airdrop.canClaim(guy.address, proof)).to.be.false;

    await expect(airdrop.connect(guy).claim(proof)).to.be.revertedWith(
      'MerkleAirdrop: Address is not a candidate for claim'
    );

    const badProof = merkleTree.getHexProof(keccak256(guy.address));

    expect(badProof).to.be.an('array').that.is.empty;

    expect(await airdrop.canClaim(guy.address, badProof)).to.be.false;

    await expect(airdrop.connect(guy).claim(badProof)).to.be.revertedWith(
      'MerkleAirdrop: Address is not a candidate for claim'
    );
  });
});