import {
    time,
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Airdrop, Token } from "../typechain-types";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";

describe("Airdrop Contract", function () {
    let token: Token;
    let airdrop: Airdrop;
    let owner: any, addr1: any, addr2: any, addr3: any, addr4: any;
    let merkleTree: MerkleTree;
    let merkleRoot: string;
    let whitelist: { address: string; amount: bigint }[];

    beforeEach(async function () {
        [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();

        // Deploy the Token contract
        const Token = await ethers.getContractFactory("Token");
        token = await Token.deploy();
        await token.waitForDeployment();

        // Set up whitelisted addresses
        whitelist = [
            { address: addr1.address, amount: ethers.parseEther("100") },
            { address: addr2.address, amount: ethers.parseEther("200") },
            { address: addr3.address, amount: ethers.parseEther("300") }
        ];

        // Generate Merkle Tree
        const leafNodes = whitelist.map(({ address, amount }) =>
            ethers.solidityPackedKeccak256(["address", "uint256"], [address, amount])
        );
        merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });
        merkleRoot = merkleTree.getHexRoot();

        // Deploy the Airdrop contract
        const Airdrop = await ethers.getContractFactory("Airdrop");
        airdrop = await Airdrop.deploy(merkleRoot, await token.getAddress());
        await airdrop.waitForDeployment();

        // Transfer tokens to the Airdrop contract
        await token.transfer(await airdrop.getAddress(), ethers.parseEther("1000"));
    });

    function getMerkleProof(address: string, amount: bigint): string[] {
        const leaf = ethers.solidityPackedKeccak256(["address", "uint256"], [address, amount]);
        return merkleTree.getHexProof(leaf);
    }

    describe("Deployment", function () {
        it("Should set the correct Merkle root", async function () {
            expect(await airdrop.merkleRoot()).to.equal(merkleRoot);
        });

        it("Should set the correct token address", async function () {
            expect(await airdrop.token()).to.equal(await token.getAddress());
        });

        it("Should set the correct owner", async function () {
            expect(await airdrop.owner()).to.equal(owner.address);
        });
    });

    describe("Claiming Airdrop", function () {
        it("Should allow a whitelisted address to claim", async function () {
            const proof = getMerkleProof(addr1.address, whitelist[0].amount);
            const amount = whitelist[0].amount;

            await expect(airdrop.connect(addr1).claim(proof, amount))
                .to.emit(airdrop, "Claimed")
                .withArgs(addr1.address, amount);

            expect(await token.balanceOf(addr1.address)).to.equal(amount);
            expect(await airdrop.hasClaimed(addr1.address)).to.be.true;
        });

        it("Should prevent double claiming", async function () {
            const proof = getMerkleProof(addr1.address, whitelist[0].amount);
            const amount = whitelist[0].amount;

            await airdrop.connect(addr1).claim(proof, amount);
            await expect(airdrop.connect(addr1).claim(proof, amount))
                .to.be.revertedWithCustomError(airdrop, "ALREADY_CLAIMED");
        });

        it("Should reject an invalid proof", async function () {
            const wrongProof = getMerkleProof(addr2.address, whitelist[1].amount);
            const wrongAmount = whitelist[1].amount;

            await expect(airdrop.connect(addr1).claim(wrongProof, wrongAmount))
                .to.be.revertedWithCustomError(airdrop, "NOT_WHITELISTED");
        });

        it("Should reject if the contract has insufficient funds", async function () {
            await token.transfer(owner.address, await token.balanceOf(await airdrop.getAddress()));

            const proof = getMerkleProof(addr1.address, whitelist[0].amount);
            const amount = whitelist[0].amount;

            await expect(airdrop.connect(addr1).claim(proof, amount))
                .to.be.revertedWithCustomError(airdrop, "TRANSFER_FAILED");
        });
    });

    describe("Admin Functions", function () {
        it("Should allow owner to update the Merkle root", async function () {
            const newTree = new MerkleTree(
                [ethers.solidityPackedKeccak256(["address", "uint256"], [addr1.address, ethers.parseEther("500")])],
                keccak256,
                { sortPairs: true }
            );
            const newRoot = newTree.getHexRoot();

            await expect(airdrop.connect(owner).updateMerkleRoot(newRoot))
                .to.emit(airdrop, "UpdatedMerkleRoot")
                .withArgs(newRoot);

            expect(await airdrop.merkleRoot()).to.equal(newRoot);
        });

        it("Should prevent non-owners from updating the Merkle root", async function () {
            const newTree = new MerkleTree(
                [ethers.solidityPackedKeccak256(["address", "uint256"], [addr1.address, ethers.parseEther("500")])],
                keccak256,
                { sortPairs: true }
            );
            const newRoot = newTree.getHexRoot();

            await expect(airdrop.connect(addr1).updateMerkleRoot(newRoot))
                .to.be.revertedWithCustomError(airdrop, "OwnableUnauthorizedAccount")
                .withArgs(addr1.address);
        });
    });
});
