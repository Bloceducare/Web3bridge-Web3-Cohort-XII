import { ethers } from "hardhat";

async function main() {
    const [signer] = await ethers.getSigners();

    // Deploy ERC20 token
    const MyToken = await ethers.getContractFactory("MyToken");
    const token = await MyToken.deploy();
    await token.waitForDeployment();
    console.log("Token deployed to:", await token.getAddress());

    const tokenAddress = await token.getAddress();
    const IERC20 = await ethers.getContractAt("IERC20", tokenAddress);

    // Deploy SealedBidAuction with token address
    const SealedBidAuction = await ethers.getContractFactory("SealedBidAuction", signer);
    
    // Here's the explicit typing to match the contract constructor
    const auction = await SealedBidAuction.deploy(
        tokenAddress, // address _tokenAddress
        ethers.parseEther("100"), // uint256 _minBid
        3600, // uint256 _duration
        {} // This empty object represents an optional overrides parameter which TypeScript might be expecting
    );
    await auction.waitForDeployment();
    console.log("Auction deployed to:", await auction.getAddress());

    // Approve the auction contract to spend tokens on behalf of the deployer
    const approveTx = await IERC20.approve(await auction.getAddress(), ethers.parseEther("100000")); // Approve enough for testing
    await approveTx.wait();
    console.log("Approval transaction hash:", approveTx.hash);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});