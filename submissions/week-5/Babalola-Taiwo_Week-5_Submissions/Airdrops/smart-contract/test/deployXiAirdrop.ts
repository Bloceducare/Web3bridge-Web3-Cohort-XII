import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";

describe("XiAirdrop", () => {
    async function deployTokenAndAirdropFixture() {
        const [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
        
        // Deploy XiTK Token
        const Token = await ethers.getContractFactory("XiTK");
        const tokenInstance = await Token.deploy();

        // Generate Merkle Tree
        const addresses = [
            [addr1.address, ethers.parseEther("0.1").toString()], 
            [addr2.address, ethers.parseEther("0.1").toString()],
            [addr3.address, ethers.parseEther("0.1").toString()],
            [addr4.address, ethers.parseEther("0.1").toString()]
        ];
        const merkleTree = StandardMerkleTree.of(addresses, ["address", "uint256"]);
        const merkleRoot = merkleTree.root;

        // Deploy XiAirdrop Contract
        const Airdrop = await ethers.getContractFactory("XiAirdrop");
        const airdropInstance = await Airdrop.deploy(merkleRoot, tokenInstance.target);

        return { tokenInstance, airdropInstance, owner, addr1, addr2, addr3, addr4, merkleRoot, merkleTree, addresses };
    }

    describe("Deployment", () => {
        it("Should deploy XiTK token contract", async () => {
            const { tokenInstance } = await loadFixture(deployTokenAndAirdropFixture);
            expect(await tokenInstance.symbol()).to.equal("XTK"); // Ensure the token symbol matches
        });

        it("Should deploy XiAirdrop contract with correct Merkle Root", async () => {
            const { airdropInstance, merkleRoot } = await loadFixture(deployTokenAndAirdropFixture);
            expect(await airdropInstance.merkleRoot()).to.equal(merkleRoot);
        });
    });

    describe("Claiming Tokens", () => {
        it("Should allow claim if proof and amount are correct", async () => {
            const { airdropInstance, addr1, tokenInstance, merkleTree, addresses } = await loadFixture(deployTokenAndAirdropFixture);
            
            // Find index of addr1 in merkle tree
            let index = addresses.findIndex(entry => entry[0] === addr1.address);
            const proof = merkleTree.getProof(index);
            const amount = ethers.parseEther("0.1");

            await airdropInstance.connect(addr1).claim(proof, amount);
            expect(await tokenInstance.balanceOf(addr1.address)).to.equal(amount);
        });

        it("Should revert if proof is incorrect", async () => {
            const { airdropInstance, addr1, addr2, merkleTree } = await loadFixture(deployTokenAndAirdropFixture);
            
            let index = addresses.findIndex(entry => entry[0] === addr2.address);
            const incorrectProof = merkleTree.getProof(index);
            const amount = ethers.parseEther("0.1");

            await expect(
                airdropInstance.connect(addr1).claim(incorrectProof, amount)
            ).to.be.revertedWithCustomError(airdropInstance, "NOTWHITELISTED");
        });

        it("Should update merkle root after claiming", async () => {
            const { airdropInstance, addr1, merkleTree, addresses } = await loadFixture(deployTokenAndAirdropFixture);
            
            // Find index of addr1 and generate proof
            let index = addresses.findIndex(entry => entry[0] === addr1.address);
            const proof = merkleTree.getProof(index);
            const amount = ethers.parseEther("0.1");

            await airdropInstance.connect(addr1).claim(proof, amount);

            // Remove addr1 and generate new Merkle Root
            addresses.splice(index, 1);
            const newMerkleRoot = StandardMerkleTree.of(addresses, ["address", "uint256"]).root;

            await airdropInstance.updateMerkleRoot(newMerkleRoot);
            expect(await airdropInstance.merkleRoot()).to.not.equal(merkleTree.root);
        });

        it("Should not allow non-owner to update merkle root", async () => {
            const { airdropInstance, addr1, addresses } = await loadFixture(deployTokenAndAirdropFixture);
            
            // Generate new merkle root
            const newMerkleRoot = StandardMerkleTree.of(addresses, ["address", "uint256"]).root;

            await expect(
                airdropInstance.connect(addr1).updateMerkleRoot(newMerkleRoot)
            ).to.be.reverted;
        });
    });
});
