import { ethers } from "hardhat";

async function main() {
    const signers = await ethers.getSigners();
    if (signers.length < 1) {
        throw new Error("At least one signer is required for this script to run.");
    }

    const owner = signers[0];
    const bidders = signers.slice(1);

    const tokenAddress = "0x4caa4a0Eb0A9050e5E0409FDDcbecD2Fcd2Ac29f"; // Replace with actual token address
    const auctionAddress = "0x9Cf77CcED6817c8115d5a76DD97cb49EA2f21162"; // Replace with actual auction address

    const token = await ethers.getContractAt("IERC20", tokenAddress);
    const auction = await ethers.getContractAt("SealedBidAuction", auctionAddress);

    // Transfer tokens to bidders for bidding
    for (let bidder of bidders) {
        await token.transfer(bidder.address, ethers.parseEther("1000"));
    }

    // Bidders submit bids
    for (let i = 0; i < bidders.length; i++) {
        const bidValue = ethers.parseEther((i + 1) * 100 + "");
        const secret = `secret${i+1}`;
        const sealedBid = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "string"], [bidValue, secret]));
        
        await token.connect(bidders[i]).approve(auctionAddress, bidValue);
        await auction.connect(bidders[i]).submitBid(sealedBid, bidValue);
        console.log(`Bidder ${i+1} submitted bid: ${ethers.formatEther(bidValue)}`);
    }

    console.log("Waiting for auction deadline and reveal period. Please wait for the appropriate time in real world before proceeding.");
    
    console.log("Press Enter when enough time has passed for both auction deadline and reveal period:");
    await new Promise(resolve => process.stdin.once('data', resolve));

    // Check if the reveal period is over before attempting to end the auction
    const deadline = await auction.deadline();
    const currentTime = BigInt(Math.floor(Date.now() / 1000)); // Current time in Unix timestamp as BigInt
    const revealPeriod = BigInt(60); // 1 minute in seconds as BigInt

    if (currentTime < deadline + revealPeriod) {
        console.log("Error: Reveal period has not ended yet. Please wait longer and run this script again.");
        return;
    }

    // Bidders reveal their bids
    for (let i = 0; i < bidders.length; i++) {
        const bidValue = ethers.parseEther((i + 1) * 100 + "");
        const secret = `secret${i+1}`;
        await auction.connect(bidders[i]).revealBid(bidValue, secret);
        console.log(`Bidder ${i+1} revealed bid.`);
    }

    // End the auction
    try {
        await auction.endAuction();
        console.log("Auction ended successfully.");

        // Check results
        const winner = await auction.highestBidder();
        const winningBid = await auction.highestBid();
        console.log("Winner:", winner);
        console.log("Winning Bid:", ethers.formatEther(winningBid));

        // Optional: Check balances or other states post-auction
        const auctionBalance = await token.balanceOf(auctionAddress);
        const sellerBalance = await token.balanceOf(owner.address);
        console.log("Auction Contract Token Balance:", ethers.formatEther(auctionBalance));
        console.log("Seller's Token Balance:", ethers.formatEther(sellerBalance));
    } catch (error) {
        console.error("Failed to end the auction:", error);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});