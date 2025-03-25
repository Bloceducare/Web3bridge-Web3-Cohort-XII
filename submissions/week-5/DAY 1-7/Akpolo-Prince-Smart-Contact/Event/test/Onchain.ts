const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

// Helper function to deploy contracts
async function deployContracts() {
    const OnChainNFT = await ethers.getContractFactory("OnChainNFT");
    const onChainNFT = await OnChainNFT.deploy();
    await onChainNFT.waitForDeployment(); // Ensure the contract is fully deployed

    const [owner, user1, user2] = await ethers.getSigners();
    return { onChainNFT, owner, user1, user2 };
}

describe("OnChainNFT", function () {
    describe("Deployment", function () {
        it("should set the correct name and symbol during deployment", async function () {
            const { onChainNFT } = await loadFixture(deployContracts);
            expect(await onChainNFT.name()).to.equal("OnChainNFT");
            expect(await onChainNFT.symbol()).to.equal("OCNFT");
        });

        it("should start the token ID counter at 1", async function () {
            const { onChainNFT } = await loadFixture(deployContracts);
            const tokenId = await onChainNFT.tokenIdCounter();
            expect(tokenId).to.equal(1); // The first token ID should be 1
        });
    });

    
    describe("Minting", function () {
        it("should allow users to mint a new NFT", async function () {
            const { onChainNFT, user1 } = await loadFixture(deployContracts);

            // Mint an NFT
            await onChainNFT.connect(user1).mint();

            // Verify the minted NFT
            const tokenId = 1; // First token ID
            expect(await onChainNFT.ownerOf(tokenId)).to.equal(user1.address); // User1 owns the NFT
            expect(await onChainNFT.balanceOf(user1.address)).to.equal(1); // User1 has 1 NFT
        });

        it("should increment the token ID counter after minting", async function () {
            const { onChainNFT, user1 } = await loadFixture(deployContracts);

            // Mint two NFTs
            await onChainNFT.connect(user1).mint();
            await onChainNFT.connect(user1).mint();

            // Verify the token ID counter
            const currentTokenId = await onChainNFT.tokenIdCounter();
            expect(currentTokenId).to.equal(3); // Counter should be at 3 after minting 2 tokens
        });
    });

    describe("Token URI", function () {
        it("should generate a valid tokenURI for a minted NFT", async function () {
            const { onChainNFT, user1 } = await loadFixture(deployContracts);

            // Mint an NFT
            await onChainNFT.connect(user1).mint();

            // Get the tokenURI for the minted NFT
            const tokenId = 1; // First token ID
            const tokenURI = await onChainNFT.tokenURI(tokenId);

            // Verify the tokenURI format
            expect(tokenURI.startsWith("data:application/json;base64,")).to.be.true;

            // Decode the JSON metadata from the tokenURI
            const base64Metadata = tokenURI.replace("data:application/json;base64,", "");
            const decodedMetadata = Buffer.from(base64Metadata, "base64").toString("utf8");

            // Parse the JSON metadata
            const metadata = JSON.parse(decodedMetadata);
            expect(metadata.name).to.equal("OnChainNFT #1");
            expect(metadata.description).to.equal(
                "This is an on-chain NFT with metadata stored entirely on the blockchain."
            );
            expect(metadata.image.startsWith("data:image/svg+xml;base64,")).to.be.true;
        });

        it("should reject tokenURI calls for non-existent tokens", async function () {
            const { onChainNFT } = await loadFixture(deployContracts);

            const invalidTokenId = 999; // Non-existent token ID
            await expect(onChainNFT.tokenURI(invalidTokenId))
                .to.be.revertedWithCustomError(onChainNFT, "ERC721NonexistentToken"); // Correct custom error
        });
    });

    describe("Ownership", function () {
        it("should assign ownership to the minter", async function () {
            const { onChainNFT, user1 } = await loadFixture(deployContracts);

            // Mint an NFT
            await onChainNFT.connect(user1).mint();

            // Verify ownership
            const tokenId = 1; // First token ID
            expect(await onChainNFT.ownerOf(tokenId)).to.equal(user1.address);
        });

        it("should reject ownership queries for non-existent tokens", async function () {
            const { onChainNFT } = await loadFixture(deployContracts);

            const invalidTokenId = 999; // Non-existent token ID
            await expect(onChainNFT.ownerOf(invalidTokenId))
                .to.be.revertedWithCustomError(onChainNFT, "ERC721NonexistentToken"); // Correct custom error
        });
    });
});