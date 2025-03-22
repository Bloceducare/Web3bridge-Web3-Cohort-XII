import { ethers } from "hardhat";

async function main() {
  console.log("Deploying EventContract...");

  const merkleRoot = "0x7e519ea6ab4891ddff470d5b23f1d341c228eb05372af035fb95b11e9d2922ac"; // Insert the correct Merkle root
  const tokenAddress = "0x48118f711a06a3C93A54A04Bcde10A48e51C5C67"; // Insert the deployed XiTK token address

  // Deploy EventContract
  const XiAirdrop = await ethers.getContractFactory("XiAirdrop");
  const xiAirdropContract = await XiAirdrop.deploy(merkleRoot, tokenAddress);

  await xiAirdropContract.waitForDeployment();
  console.log(`XiAirdrop contract deployed at: ${await xiAirdropContract.getAddress()}`);
}

// Run the deployment script
main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});