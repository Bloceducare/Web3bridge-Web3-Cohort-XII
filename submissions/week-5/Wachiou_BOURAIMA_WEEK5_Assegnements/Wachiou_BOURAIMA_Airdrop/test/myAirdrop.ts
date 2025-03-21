import { expect } from "chai";
import hre from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";


    
describe("MyAirdrop", function () {
    async function deployAirdropFixture() {
        const [owner, user1, user2] = await hre.ethers.getSigners();
        // const Token = await hre.ethers.getContractFactory("ERC20Token");
        // const token = await Token.deploy("TestToken", "TTK", 1000000);

        const elements = [user1, user2].map(user =>
            keccak256(hre.ethers.solidityPacked(["address", "uint256"], [user.address, 100])))
        const merkleTree = new MerkleTree(elements, keccak256, { sortPairs: true });
        const merkleRoot = merkleTree.getHexRoot();

        const MyAirdrop = await hre.ethers.getContractFactory("MyAirdrop");
        const airdrop = await MyAirdrop.deploy(merkleRoot, "WassToken", "WTK", 100000);

        // await token.mint(airdrop.target, 10000);

        return { airdrop, owner, user1, user2, merkleTree };
    }

    describe("Deployment", function () {
        it("should deploy the contract correctly", async function () {
            const { airdrop } = await loadFixture(deployAirdropFixture);
            // expect(await airdrop.token()).to.equal(token.target);
        });
    });

    describe("Claiming Airdrop", function () {
        it("should allow a valid claim", async function () {
            const { airdrop, user1, merkleTree } = await loadFixture(deployAirdropFixture);
            const amount = 100;
            const leaf = keccak256(hre.ethers.solidityPacked(["address", "uint256"], [user1.address, amount]));
            const proof = merkleTree.getHexProof(leaf);

            await expect(airdrop.connect(user1).claim(amount, proof))
                .to.emit(airdrop, "Claimed")
                .withArgs(user1.address, amount);
            expect(await airdrop.connect(user1)._balanceOf()).to.equal(amount);
        });

        it("should not allow double claiming", async function () {
            const { airdrop, user1, merkleTree } = await loadFixture(deployAirdropFixture);
            const amount = 100;
            const leaf = keccak256(hre.ethers.solidityPacked(["address", "uint256"], [user1.address, amount]));
            const proof = merkleTree.getHexProof(leaf);

            await airdrop.connect(user1).claim(amount, proof);
            await expect(airdrop.connect(user1).claim(amount, proof)).to.be.revertedWithCustomError(airdrop, "AlreadyClaimed");
        });

        it("should reject an invalid proof", async function () {
            const { airdrop, user2 } = await loadFixture(deployAirdropFixture);
            const amount = 100;
            const fakeProof = [keccak256("invalid")];

            await expect(airdrop.connect(user2).claim(amount, fakeProof)).to.be.revertedWithCustomError(airdrop, "InvalidProof");
        });
        it("should reject an invalid amount", async function () {
            const { airdrop, user1, merkleTree } = await loadFixture(deployAirdropFixture);
            const amount = 100;
            const fakeAmount = 200;
            const leaf = keccak256(hre.ethers.solidityPacked(["address", "uint256"], [user1.address, amount]));
            const proof = merkleTree.getHexProof(leaf);

            await expect(airdrop.connect(user1).claim(fakeAmount, proof)).to.be.revertedWithCustomError(airdrop, "InvalidProof");
        });
    });
    it("should reject an invalid address", async function () {
        const { airdrop, user2, merkleTree } = await loadFixture(deployAirdropFixture);
        const amount = 100;
        const fakeAddress = hre.ethers.Wallet.createRandom().address;
        const leaf = keccak256(hre.ethers.solidityPacked(["address", "uint256"], [fakeAddress, amount]));
        const proof = merkleTree.getHexProof(leaf);

        await expect(airdrop.connect(user2).claim(amount, proof)).to.be.revertedWithCustomError(airdrop, "InvalidProof");
    });
});
