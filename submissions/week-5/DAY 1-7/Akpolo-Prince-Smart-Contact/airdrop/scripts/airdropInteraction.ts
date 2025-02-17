const hre = require("hardhat");

async function main() {
  // Replace with your contract address
  const airdropAddress = "0xABa92335453d8c97c5A550827dffa0E95977384F";
  const Airdrop = await hre.ethers.getContractFactory("AkpoloAirdrop");
  const airdrop = Airdrop.attach(airdropAddress);

  const [owner, user] = await hre.ethers.getSigners();

  console.log("Owner Address:", owner.address);
  console.log("User Address:", user.address);

  // Example: Get contract balance (onlyOwner)
  const balance = await airdrop.connect(owner).getBalance();
  console.log("Contract Balance:", hre.ethers.formatEther(balance), "tokens");
  
  // Example: Claim airdrop (user)
  const merkleProof =  [
    '0x86cf03732f16416e2ce01afe880f4e586fc44f147cc0369614a82df4c5c3dc0e',
    '0xfc7dc081f14d9133299ff1219b256f45aefdd19d42e5f2ace7c6458c765dfb37'
  ]
  
  console.log("Claiming airdrop for user:", user.address);
  const txClaim = await airdrop.connect(user).getDrop(merkleProof);
  await txClaim.wait();
  console.log("Airdrop claimed successfully! Transaction Hash:", txClaim.hash);

  // Check user's balance after claiming
  const tokenAddress = await airdrop.token(); // Fetch the actual token address
const token = await hre.ethers.getContractAt("IERC20", tokenAddress); 

// Now call balanceOf on the token contract
const userBalance = await token.balanceOf(user.address);
console.log("User Balance After Claim:", hre.ethers.formatEther(userBalance), "tokens");

  // Example: Withdraw funds (onlyOwner)
  // console.log("Withdrawing funds to owner:", owner.address);
  // const txWithdraw = await airdrop.connect(owner).withdraw();
  // await txWithdraw.wait();
  // console.log("Funds withdrawn successfully! Transaction Hash:", txWithdraw.hash);

  // Check contract balance after withdrawal
  const contractBalanceAfterWithdraw = await airdrop.connect(owner).getBalance();
  console.log("Contract Balance After Withdrawal:", hre.ethers.formatEther(contractBalanceAfterWithdraw), "tokens");

  // Example: Change drop amount (onlyOwner)
  const newAmount = hre.ethers.parseEther("200"); // 200 tokens
  console.log("Changing drop amount to:", hre.ethers.formatEther(newAmount), "tokens");
  const txChangeAmount = await airdrop.connect(owner).changeDropAmount(newAmount);
  await txChangeAmount.wait();
  console.log("Drop amount changed successfully! Transaction Hash:", txChangeAmount.hash);

  // Check new drop amount
  const updatedDropAmount = await airdrop.dropAmount();
  console.log("Updated Drop Amount:", hre.ethers.formatEther(updatedDropAmount), "tokens");

//   // Example: Change token address (onlyOwner)
//   const newTokenAddress = "0xNewERC20TokenAddress"; // Replace with new token address
//   console.log("Changing token address to:", newTokenAddress);
//   const txChangeToken = await airdrop.connect(owner).newToken(newTokenAddress);
//   await txChangeToken.wait();
//   console.log("Token address changed successfully! Transaction Hash:", txChangeToken.hash);

//   // Check new token address
//   const updatedTokenAddress = await airdrop.token();
//   console.log("Updated Token Address:", updatedTokenAddress);

//   // Example: Change Merkle Root (onlyOwner)
//   const newMerkleRoot = "0xNewMerkleRoot"; // Replace with new Merkle Root
//   console.log("Changing Merkle Root to:", newMerkleRoot);
//   const txChangeMerkleRoot = await airdrop.connect(owner).changeMerkleRoot(newMerkleRoot);
//   await txChangeMerkleRoot.wait();
//   console.log("Merkle Root changed successfully! Transaction Hash:", txChangeMerkleRoot.hash);

//   // Check new Merkle Root
//   const updatedMerkleRoot = await airdrop.merkleRoot();
//   console.log("Updated Merkle Root:", updatedMerkleRoot);

  // Example: Reset claim status (onlyOwner)
  const userAddress = user.address; // Replace with user address
  console.log("Resetting claim status for user:", userAddress);
  const txResetClaim = await airdrop.connect(owner).resetClaimStatus(userAddress);
  await txResetClaim.wait();
  console.log("Claim status reset successfully! Transaction Hash:", txResetClaim.hash);

  // Check claim status
  const claimStatus = await airdrop.hasClaimed(userAddress);
  console.log("Claim Status for User:", claimStatus ? "Claimed" : "Not Claimed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});