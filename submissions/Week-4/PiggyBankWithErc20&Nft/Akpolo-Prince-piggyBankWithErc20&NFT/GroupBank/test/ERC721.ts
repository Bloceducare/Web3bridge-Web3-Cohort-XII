const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

async function deployContracts() {
    const OurErc721 = await ethers.getContractFactory("ourErc721");
    const ourErc721 = await OurErc721.deploy("OurNFT", "ONFT");
    await ourErc721.waitForDeployment();

    const [owner, user1, user2] = await ethers.getSigners();
    return { ourErc721, owner, user1, user2 };
}

describe("ourErc721", function () {
    describe("Deployment", function () {
        it("should set the correct name and symbol", async function () {
            const { ourErc721 } = await loadFixture(deployContracts);
            expect(await ourErc721.name()).to.equal("OurNFT");
            expect(await ourErc721.symbol()).to.equal("ONFT");
        });

        it("should mint an NFT to the deployer during deployment", async function () {
            const { ourErc721, owner } = await loadFixture(deployContracts);

            const tokenId = 1; // The first NFT ID
            expect(await ourErc721.ownerOf(tokenId)).to.equal(owner.address); // Owner owns the NFT
            expect(await ourErc721.balanceOf(owner.address)).to.equal(1); // Owner has 1 NFT
        });
    });

    describe("Minting", function () {
        it("should allow the owner to mint new NFTs", async function () {
            const { ourErc721, owner, user1 } = await loadFixture(deployContracts);

            const recipient = user1.address;
            const tokenId = 2; // Next available token ID

            // Mint a new NFT
            await ourErc721.connect(owner).mint(recipient, tokenId);

            // Verify the minted NFT
            expect(await ourErc721.ownerOf(tokenId)).to.equal(recipient); // User1 owns the NFT
            expect(await ourErc721.balanceOf(recipient)).to.equal(1); // User1 has 1 NFT
        });

        it("should reject minting from non-owner accounts", async function () {
            const { ourErc721, user1 } = await loadFixture(deployContracts);

            const recipient = user1.address;
            const tokenId = 2; // Next available token ID

            // Attempt to mint as a non-owner
            await expect(
                ourErc721.connect(user1).mint(recipient, tokenId)
            ).to.be.revertedWithCustomError(ourErc721, "OwnableUnauthorizedAccount");
        });
    });

    describe("Ownership", function () {
        it("should set the deployer as the owner", async function () {
            const { ourErc721, owner } = await loadFixture(deployContracts);
            expect(await ourErc721.owner()).to.equal(owner.address);
        });

        it("should allow the owner to transfer ownership", async function () {
            const { ourErc721, owner, user1 } = await loadFixture(deployContracts);

            // Transfer ownership to user1
            await ourErc721.connect(owner).transferOwnership(user1.address);

            // Verify the new owner
            expect(await ourErc721.owner()).to.equal(user1.address);
        });

        it("should reject ownership transfer from non-owner accounts", async function () {
            const { ourErc721, user1 } = await loadFixture(deployContracts);

            // Attempt to transfer ownership as a non-owner
            await expect(
                ourErc721.connect(user1).transferOwnership(user1.address)
            ).to.be.revertedWithCustomError(ourErc721, "OwnableUnauthorizedAccount");
        });
    });

    describe("Token Transfers", function () {
        it("should allow the owner to transfer an NFT", async function () {
            const { ourErc721, owner, user1 } = await loadFixture(deployContracts);
    
            const tokenId = 1; // The first NFT ID
    
            // Transfer the NFT to user1
            await ourErc721.connect(owner).safeTransferFrom(owner.address, user1.address, tokenId);
    
            // Verify the transfer
            expect(await ourErc721.ownerOf(tokenId)).to.equal(user1.address); // User1 now owns the NFT
            expect(await ourErc721.balanceOf(owner.address)).to.equal(0); // Owner no longer owns the NFT
            expect(await ourErc721.balanceOf(user1.address)).to.equal(1); // User1 has 1 NFT
        });
    
        it("should reject transfers from non-owners", async function () {
            const { ourErc721, owner, user1, user2 } = await loadFixture(deployContracts);
    
            const tokenId = 1; // The first NFT ID
    
            // Attempt to transfer the NFT as a non-owner (user1)
            await expect(
                ourErc721.connect(user1).safeTransferFrom(owner.address, user2.address, tokenId)
            ).to.be.revertedWithCustomError(ourErc721, "ERC721InsufficientApproval");
        });
    
        it("should allow approved addresses to transfer an NFT", async function () {
            const { ourErc721, owner, user1, user2 } = await loadFixture(deployContracts);
    
            const tokenId = 1; // The first NFT ID
    
            // Approve user1 to transfer the NFT
            await ourErc721.connect(owner).approve(user1.address, tokenId);
    
            // Transfer the NFT using user1
            await ourErc721.connect(user1).safeTransferFrom(owner.address, user2.address, tokenId);
    
            // Verify the transfer
            expect(await ourErc721.ownerOf(tokenId)).to.equal(user2.address); // User2 now owns the NFT
            expect(await ourErc721.balanceOf(owner.address)).to.equal(0); // Owner no longer owns the NFT
            expect(await ourErc721.balanceOf(user2.address)).to.equal(1); // User2 has 1 NFT
        });
    
        it("should reject transfers of non-existent tokens", async function () {
            const { ourErc721, owner, user1 } = await loadFixture(deployContracts);
    
            const invalidTokenId = 999; // Non-existent token ID
    
            // Attempt to transfer a non-existent token
            await expect(
                ourErc721.connect(owner).safeTransferFrom(owner.address, user1.address, invalidTokenId)
            ).to.be.revertedWithCustomError(ourErc721, "ERC721NonexistentToken");
        });
    });
    describe("Approval Management", function () {
        it("should allow the owner to approve another address to transfer an NFT", async function () {
            const { ourErc721, owner, user1 } = await loadFixture(deployContracts);

            const tokenId = 1; // The first NFT ID

            // Approve user1 to transfer the NFT
            await ourErc721.connect(owner).approve(user1.address, tokenId);

            // Verify the approval
            expect(await ourErc721.getApproved(tokenId)).to.equal(user1.address);
        });

        it("should reject approvals for non-existent tokens", async function () {
            const { ourErc721, owner, user1 } = await loadFixture(deployContracts);

            const invalidTokenId = 999; // Non-existent token ID

            // Attempt to approve a non-existent token
            await expect(
                ourErc721.connect(owner).approve(user1.address, invalidTokenId)
            ).to.be.revertedWithCustomError(ourErc721, "ERC721NonexistentToken");
        });
    });
});