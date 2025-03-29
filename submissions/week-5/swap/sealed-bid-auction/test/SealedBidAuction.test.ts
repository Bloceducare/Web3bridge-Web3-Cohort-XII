import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { MyToken, SealedBidAuction } from "../typechain-types";
import { Signer } from "ethers";

describe("SealedBidAuction", function() {
    async function deployAuctionFixture(): Promise<{
        auction: SealedBidAuction;
        token: MyToken;
        owner: SignerWithAddress;
        bidder1: SignerWithAddress;
        bidder2: SignerWithAddress;
    }> {
        const [owner, bidder1, bidder2] = await ethers.getSigners();
        const Token = await ethers.getContractFactory("MyToken");
        const token = await Token.deploy() as MyToken;
        await token.waitForDeployment();

        const SealedBidAuction = await ethers.getContractFactory("SealedBidAuction");
        const auction = await SealedBidAuction.deploy(await token.getAddress(), ethers.parseEther("0.1"), 60) as SealedBidAuction;
        await auction.waitForDeployment();
        return { auction, token, owner, bidder1, bidder2 };
    }

    it("Should handle a simple sealed bid auction with 1 minute reveal period", async function() {
        const { auction, token, owner, bidder1, bidder2 } = await loadFixture(deployAuctionFixture);

        // Transfer tokens to bidders for bidding
        await token.connect(owner as unknown as Signer).transfer(await bidder1.getAddress(), ethers.parseEther("1000"));
        await token.connect(owner as unknown as Signer).transfer(await bidder2.getAddress(), ethers.parseEther("1000"));

        // Bid submissions
        const bid1Value = ethers.parseEther("1");
        const secret1 = "secret1";
        console.log(typeof secret1, secret1); // Should output 'string secret1'
        const sealedBid1 = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "string"], [bid1Value, ethers.toUtf8Bytes(secret1)]));
        console.log("Sealed Bid 1:", sealedBid1);

        const bid2Value = ethers.parseEther("2");
        const secret2 = "secret2";
        console.log(typeof secret2, secret2); // Should output 'string secret2'
        const sealedBid2 = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "string"], [bid2Value, ethers.toUtf8Bytes(secret2)]));
        console.log("Sealed Bid 2:", sealedBid2);

        await token.connect(bidder1 as unknown as Signer).approve(await auction.getAddress(), bid1Value);
        await auction.connect(bidder1 as unknown as Signer).submitBid(sealedBid1, bid1Value);

        await token.connect(bidder2 as unknown as Signer).approve(await auction.getAddress(), bid2Value);
        await auction.connect(bidder2 as unknown as Signer).submitBid(sealedBid2, bid2Value);

        // Move time to end auction
        await ethers.provider.send("evm_increaseTime", [61]); // Ensure this exceeds the auction duration
        await ethers.provider.send("evm_mine");

        // Reveal bids
        await auction.connect(bidder1 as unknown as Signer).revealBid(bid1Value, secret1); 
        await auction.connect(bidder2 as unknown as Signer).revealBid(bid2Value, secret2); 

        // Move time for reveal period
        await ethers.provider.send("evm_increaseTime", [60]); // Match the reveal period
        await ethers.provider.send("evm_mine");

        // End auction
        await auction.endAuction();

        // Check results
        const winner = await auction.highestBidder();
        const winningBid = await auction.highestBid();
        expect(winner).to.equal(await bidder2.getAddress());
        expect(winningBid).to.equal(bid2Value);

        // Optional: Check token balances post-auction
        const auctionBalance = await token.balanceOf(await auction.getAddress());
        const sellerBalance = await token.balanceOf(await owner.getAddress());
        console.log("Auction Contract Token Balance:", ethers.formatEther(auctionBalance));
        console.log("Seller's Token Balance:", ethers.formatEther(sellerBalance));

        expect(auctionBalance).to.equal(0); // Assuming all tokens are transferred
        expect(sellerBalance).to.equal(ethers.parseEther("2.1")); // Initial 1 + winning bid of 2
    });
});