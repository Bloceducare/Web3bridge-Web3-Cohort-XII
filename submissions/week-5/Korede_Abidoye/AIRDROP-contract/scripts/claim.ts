import { ethers } from "hardhat";

async function main() {
  const airdropAddress = "0x923293a410554f8C9E03277692f9e1DE8B1B0dF1";
  const account = "0xA7CD28a9E07b32600686089ff2FC3BEdb564c2D9";
  const amount = ethers.parseUnits("1", 18);
  const merkleProof = ["0x465f8d63e58fdf557d0b762169052f2e16c240e88108e3f02440af9cda902b78"]; // Your actual proof

  const airdrop = await ethers.getContractAt("AirdropMerkle", airdropAddress);
  
  // Connect with the claiming account
  const [signer] = await ethers.getSigners(); // Or use specific private key
  const tx = await airdrop.connect(signer).claim(account, amount, merkleProof);
  await tx.wait();
  
  console.log("Claim successful:", tx.hash);
}

main().catch(console.error);