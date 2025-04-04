import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
  import { expect } from "chai";
  import hre from "hardhat";
  import { ethers } from "hardhat";
  import { MerkleTree } from "merkletreejs";
  import keccak256 from "keccak256";


describe("MerkleAirdrop", function () {

    async function deployMerkleAirdropFixture() {

        const tokenAddress = "0x295d07155cc738e05f52db11fA12F290d4f0c65D";

        const  Merkleroot =  "0x262c504d831fb8042ede5d07f3718ba7c84219b8b7318981385fed6c3ffed7db";


        const [owner, address1, address2] = await hre.ethers.getSigners();

        const MerkleAirdropContract = await hre.ethers.getContractFactory("MerkleAirdrop");
        
        const airdrop = await MerkleAirdropContract.deploy(tokenAddress, Merkleroot);

        return {airdrop, address1, address2};
    }

  
});
