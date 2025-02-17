import { ethers } from "hardhat";

async function main() {
  const baycNFTAddress = "0x2FFa5b9C97B0EE110a5Aa2D51F05058E1c855B03"; // BAYC NFT contract
  const [signer] = await ethers.getSigners();

  console.log(`🚀 Minting BAYC NFT for: ${signer.address}`);

  const baycNFT = await ethers.getContractAt("BAYCNFT", baycNFTAddress);
  const tx = await baycNFT.mint();
  await tx.wait();

  console.log(`✅ BAYC NFT Minted! Transaction: ${tx.hash}`);
}

main().catch((error) => {
  console.error("❌ Minting failed:", error);
  process.exit(1);
});
