const { ethers } = require("hardhat");
const { expect } = require("chai");

async function main() {
    // Remplacez par l'adresse du token ERC20 utilisé pour les enchères
    const tokenAddress = "0xMyTokenAddressHere";

    // Déploiement du contrat
    const SealedBidAuction = await ethers.getContractFactory("SealedBidAuction");
    const auction = await SealedBidAuction.deploy(tokenAddress);

    await auction.deployed();

    console.log("SealedBidAuction deployed to:", auction.address);

    // Test de création d'une enchère
    async function testCreateAuction() {
        const [seller] = await ethers.getSigners();
        await expect(auction.createAuction(1, 100, 3600, 1800))
            .to.emit(auction, "AuctionCreated");
    }

    // Test de soumission d'une enchère
    async function testSubmitBid() {
        const [_, bidder] = await ethers.getSigners();
        const bidHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("100-secret"));
        await expect(auction.connect(bidder).submitBid(1, bidHash, 100))
            .to.emit(auction, "BidSubmitted");
    }

    // Test de révélation d'une enchère
    async function testRevealBid() {
        const [_, bidder] = await ethers.getSigners();
        await expect(auction.connect(bidder).revealBid(1, 100, "secret"))
            .to.emit(auction, "BidRevealed");
    }

    // Test de détermination du gagnant
    async function testDetermineWinner() {
        await expect(auction.determineWinner(1))
            .to.not.be.reverted;
    }

    // Test de finalisation de l'enchère
    async function testFinalizeAuction() {
        await expect(auction.finalizeAuction(1))
            .to.emit(auction, "AuctionFinalized");
    }

    await testCreateAuction();
    await testSubmitBid();
    await testRevealBid();
    await testDetermineWinner();
    await testFinalizeAuction();
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });