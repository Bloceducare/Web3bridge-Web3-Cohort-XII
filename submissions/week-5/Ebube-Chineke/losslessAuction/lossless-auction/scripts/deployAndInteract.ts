import { ethers, network } from "hardhat";

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const [admin, seller, bidder1, bidder2] = await ethers.getSigners();
  console.log("Deploying contracts with account:", admin.address);

  // Deploy AuctionFactory
  console.log("Deploying AuctionFactory...");
  const AuctionFactory = await ethers.getContractFactory("AuctionFactory");
  const auctionFactory = await AuctionFactory.deploy();
  await auctionFactory.waitForDeployment();
  const auctionFactoryAddress = auctionFactory.target;
  console.log("AuctionFactory deployed at:", auctionFactoryAddress);

  // Create a new auction
  console.log("Creating a new auction...");
  const itemName = "Exclusive Painting";
  const initialPrice = ethers.parseEther("1.0"); // 1 ETH
  const block = await ethers.provider.getBlock("latest");
  const endTime = block!.timestamp + 10; // Ends in 10 seconds

  let tx = await auctionFactory.connect(seller).createAuction(itemName, initialPrice, endTime);
  await tx.wait();

  // Get newly created auction address
  const auctionList = await auctionFactory.getAuctions();
  const auctionAddress = auctionList[auctionList.length - 1];
  console.log("Auction created at:", auctionAddress);

  // Get Auction contract instance
  const auction = await ethers.getContractAt("Auction", auctionAddress);

  // Place bids
  console.log("Bidding starts...");
  tx = await auction.connect(bidder1).placeBid({ value: ethers.parseEther("1.1") });
  await tx.wait();
  console.log(`Bidder1 (${bidder1.address}) placed a bid.`);

  tx = await auction.connect(bidder2).placeBid({ value: ethers.parseEther("1.21") });
  await tx.wait();
  console.log(`Bidder2 (${bidder2.address}) placed a higher bid.`);

  // Wait for auction to end
  console.log("Waiting for auction to end...");
  await delay(10000);

  // Seller withdraws funds
  console.log("Withdrawing funds...");
  tx = await auction.connect(seller).withdraw();
  await tx.wait();
  console.log("Funds withdrawn by seller.");

  // Fetch final auction details
  console.log("Fetching final auction details...");
  const highestBid = await auction.highestBid();
  const highestBidder = await auction.highestBidder();
  console.log(`Auction ended. Highest Bid: ${ethers.formatEther(highestBid)} ETH by ${highestBidder}`);
}

// Execute script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
