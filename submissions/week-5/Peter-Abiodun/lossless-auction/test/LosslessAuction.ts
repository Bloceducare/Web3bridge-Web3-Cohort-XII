import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Auction System", function () {
    async function deployContracts() {
        const [admin, seller, bidder1, bidder2] = await ethers.getSigners();

        // Deploy AuctionFactory contract
        const AuctionFactory = await ethers.getContractFactory("AuctionFactory");
        const auctionFactory = await AuctionFactory.deploy();
        await auctionFactory.waitForDeployment();

        return { auctionFactory, admin, seller, bidder1, bidder2 };
    }

    describe("Auction Creation", function () {
        it("Should allow users to create an auction", async function () {
            const { auctionFactory, seller } = await loadFixture(deployContracts);
            const itemName = "Antique Vase";
            const initialPrice = ethers.parseEther("1");
            const endTime = (await time.latest()) + 3600;

            const tx = await auctionFactory.connect(seller).createAuction(itemName, initialPrice, endTime);
            await expect(tx).to.emit(auctionFactory, "AuctionCreated");

            const auctions = await auctionFactory.getAuctions();
            expect(auctions.length).to.equal(1);
        });

        it("Should prevent auction creation with past end time", async function () {
            const { auctionFactory, seller } = await loadFixture(deployContracts);
            const itemName = "Painting";
            const initialPrice = ethers.parseEther("1");
            const endTime = (await time.latest()) - 10;

            await expect(
                auctionFactory.connect(seller).createAuction(itemName, initialPrice, endTime)
            ).to.be.revertedWith("End time must be in the future");
        });
    });

    describe("Bidding", function () {
        async function deployAuction() {
            const { auctionFactory, seller, bidder1, bidder2 } = await loadFixture(deployContracts);
            const itemName = "Rare Coin";
            const initialPrice = ethers.parseEther("1");
            const endTime = (await time.latest()) + 3600;
            
            await auctionFactory.connect(seller).createAuction(itemName, initialPrice, endTime);
            const auctions = await auctionFactory.getAuctions();
            const auctionAddress = auctions[0];
            const Auction = await ethers.getContractFactory("Auction");
            const auction = await Auction.attach(auctionAddress);

            return { auction, seller, bidder1, bidder2, endTime };
        }

        it("Should allow bidding higher than the minimum bid", async function () {
            const { auction, bidder1 } = await loadFixture(deployAuction);
            const bidAmount = ethers.parseEther("1.1");
            
            await expect(auction.connect(bidder1).placeBid({ value: bidAmount }))
                .to.emit(auction, "NewBid")
                .withArgs(bidder1.address, bidAmount);
        });

        it("Should prevent bidding below the minimum bid", async function () {
            const { auction, bidder1 } = await loadFixture(deployAuction);
            const bidAmount = ethers.parseEther("0.5");
            
            await expect(auction.connect(bidder1).placeBid({ value: bidAmount }))
                .to.be.revertedWith("Bid too low");
        });
        it("Should accept valid bids and track the highest bidder", async function () {
            const { auction, bidder1 } = await loadFixture(deployAuction);

            await auction.connect(bidder1).placeBid({ value: ethers.parseEther("1.1") });
            expect(await auction.highestBid()).to.equal(ethers.parseEther("1.1"));
            expect(await auction.highestBidder()).to.equal(bidder1.address);
        });

        it("Should refund the previous highest bidder when outbid", async function () {
            const { auction, bidder1, bidder2 } = await loadFixture(deployAuction);

            await auction.connect(bidder1).placeBid({ value: ethers.parseEther("1.1") });
            const bidder1BalanceBefore = await ethers.provider.getBalance(bidder1.address);
            
            await expect(auction.connect(bidder2).placeBid({ value: ethers.parseEther("1.3") }))
                .to.emit(auction, "Refund")
                .withArgs(bidder1.address, anyValue);

            const bidder1BalanceAfter = await ethers.provider.getBalance(bidder1.address);
            // console.log(`BidderBefore: ${bidder1BalanceBefore}, BidderAfter: ${bidder1BalanceAfter}`);
            
            expect(bidder1BalanceAfter).to.be.greaterThan(bidder1BalanceBefore);
            expect(await auction.highestBid()).to.equal(ethers.parseEther("1.3"));
            expect(await auction.highestBidder()).to.equal(bidder2.address);
        });

        it("Should prevent withdrawal if not seller", async function () {
            const { auction, seller, bidder1, endTime } = await loadFixture(deployAuction);
            const bidAmount = ethers.parseEther("2");
            
            await auction.connect(bidder1).placeBid({ value: bidAmount });
            await time.increaseTo(endTime + 1);

            await expect(auction.connect(bidder1).withdraw())
                .to.be.revertedWith("Only seller can call this");
        });
        it("Should allow seller to withdraw funds after auction ends", async function () {
            const { auction, seller, bidder1, endTime } = await loadFixture(deployAuction);
            const bidAmount = ethers.parseEther("2");
            
            await auction.connect(bidder1).placeBid({ value: bidAmount });
            await time.increaseTo(endTime + 1);

            await expect(auction.connect(seller).withdraw())
                .to.emit(auction, "AuctionEnded")
                .withArgs(bidder1.address, anyValue);
        });

        it("Should prevent withdrawal before auction ends", async function () {
            const { auction, seller } = await loadFixture(deployAuction);
            await expect(auction.connect(seller).withdraw())
                .to.be.revertedWith("Auction not yet ended");
        });
    });
});
