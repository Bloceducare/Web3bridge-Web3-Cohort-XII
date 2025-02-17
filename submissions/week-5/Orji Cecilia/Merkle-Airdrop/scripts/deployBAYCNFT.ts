import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying BAYCNFT...");

 const name = "Bored Ape Yacht Club";
 const symbol = "BAYC";
 const baseURI = "https://ipfs.io/ipfs/bafybeihktb22marsddux6ovoczs7cytlspaymgy56tx3aicmm4t37vmhri";

  const BAYCNFT = await ethers.getContractFactory("BAYCNFT");
  const nftContract = await BAYCNFT.deploy(name, symbol, baseURI);

  await nftContract.waitForDeployment();
  console.log(`✅ BAYCNFT deployed to: ${await nftContract.getAddress()}`);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exit(1);
});
