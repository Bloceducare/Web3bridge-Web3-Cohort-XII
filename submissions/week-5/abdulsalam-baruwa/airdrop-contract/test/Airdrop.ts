import { expect } from "chai";

import {
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import hre from "hardhat";


import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";

describe("Airdrop Contract", () => {
    const deployAirdropContractFixture = async () => {
        const [owner, address1, address2, address3] = await hre.ethers.getSigners();

        const _tokenContract = await hre.ethers.getContractFactory("Token");
        const _tokenInstance = await _tokenContract.deploy();

        const whiteList = [
            address1.address,
            address2.address,
            address3.address
        ]

        const leaves = whiteList.map(addr => keccak256(addr));
        const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
        const rootHash = merkleTree.getRoot().toString('hex');

        const airdropContract = await hre.ethers.getContractFactory("Airdrop");
        const _airdrop = await airdropContract.deploy(_tokenInstance.target, rootHash);

        // console.log(owner, address1, address2, address3)
        return { _airdrop, _tokenInstance, owner, rootHash, whiteList, address1, address2, address3 };
    }
});