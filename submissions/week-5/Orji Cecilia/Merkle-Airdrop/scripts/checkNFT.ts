import { ethers } from "hardhat";

async function main() {
  const baycNFTAddress = "0x2FFa5b9C97B0EE110a5Aa2D51F05058E1c855B03"; // Your BAYC NFT contract
  const [signer] = await ethers.getSigners();

  console.log(`🔍 Checking BAYC NFT Ownership for: ${signer.address}`);

  const baycNFT = await ethers.getContractAt("IERC721", baycNFTAddress);
  const balance = await baycNFT.balanceOf(signer.address);

  console.log(`🎟 NFT Balance: ${balance.toString()}`);
  if (Number(balance) > 0) {
    console.log("✅ You own a BAYC NFT! You can claim airdrop.");
  } else {
    console.log("❌ You DO NOT own a BAYC NFT. You must mint or transfer one to claim.");
  }
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
