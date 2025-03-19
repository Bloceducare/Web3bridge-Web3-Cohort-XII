import { ethers } from "hardhat";

async function main() {
  try {
    console.log("Starting airdrop claim process...");

    // Read deployment addresses from file
    const network = process.env.HARDHAT_NETWORK || "localhost";
    const deployments = require(`../deployments/${network}.json`);

    // Get contract instances
    console.log("Connecting to contracts...");
    const token = await ethers.getContractAt("Suspect", deployments.suspectToken);
    const merkleAirdrop = await ethers.getContractAt("MerkleAirdrop", deployments.merkleAirdrop);

    // Get token info
    const tokenName = await token.name();
    console.log(`Connected to token: ${tokenName}`);

    // Test user data
    const [owner, user] = await ethers.getSigners();
    const USER = {
      address: user.address,
      amount: ethers.parseEther("1800")
    };

    // Check initial balances
    console.log("\nChecking initial balances...");
    const contractBalance = await merkleAirdrop.getContractBalance();
    console.log(`Contract balance: ${ethers.formatEther(contractBalance)}`);
    
    const userTokenBalance = await token.balanceOf(USER.address);
    console.log(`User balance: ${ethers.formatEther(userTokenBalance)}`);

    // Merkle tree data (for testing)
    const merkleProof = [
      "0x5a14ec3b90c5dab0d3640d893dcb87ff30bae272bbf7eb37b520d7a86d098bf4",
      "0x545c8e6423cb085b9eff4f30100298a878feb885da485b6b697ba2cb64746591",
      "0x7801757d15a5d624d2209895c2374ed61f75b5f3d4fd417d83f2c8394621e7c9",
      "0xa43d49610f2a78963667a3013d940a782da13a33f6ba32311818cf72781378be",
    ];

    // Perform the claim
    console.log("\nInitiating claim transaction...");
    const claimTx = await merkleAirdrop.connect(user).claim(
      USER.address,
      USER.amount,
      merkleProof
    );

    console.log(`Transaction hash: ${claimTx.hash}`);
    console.log("Waiting for transaction confirmation...");
    
    const receipt = await claimTx.wait();
    console.log("Airdrop claimed successfully!");

    // Check final balances
    const contractBalanceAfter = await merkleAirdrop.getContractBalance();
    console.log(`Contract balance after: ${ethers.formatEther(contractBalanceAfter)}`);
    
    const userTokenBalanceAfter = await token.balanceOf(USER.address);
    console.log(`User balance after: ${ethers.formatEther(userTokenBalanceAfter)}`);

  } catch (error) {
    console.error("Error during airdrop claim:", error);
    throw error;
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}