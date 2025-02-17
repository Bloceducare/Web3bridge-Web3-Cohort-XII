import { ethers } from "hardhat";
import { XiAirdrop } from "../typechain-types";

// Replace with deployed contract address
const AIRDROP_CONTRACT_ADDRESS = "0x77DAFD1e598847c6a984Ef79B7F92C33E5384Cc5";

// Replace with user's Merkle proof and amount
const userProof: string[] = [
  "0xb01d585c7603a95fe78c3adc3e28dbf081b4a0c12475436d8c9ac16d7be95488",
  "0xf1f593a519d3b1ca8b8f838a967a2417e112e340c67d6b94239636f05c72b0ad"
]; // Ensure all values start with "0x"

const claimAmount = ethers.parseUnits("100", 18); // 100 tokens (adjust decimals)

async function claimAirdrop() {
  const [signer] = await ethers.getSigners(); // Get user wallet
  const airdropContract = await ethers.getContractAt("XiAirdrop", AIRDROP_CONTRACT_ADDRESS, signer) as XiAirdrop;

  console.log(`Claiming ${ethers.formatUnits(claimAmount, 18)} tokens for address: ${signer.address}...`);

  try {
    // Convert proof to proper bytes32[] format
    const formattedProof = userProof.map(p => ethers.hexlify(p));
    
    const tx = await airdropContract.claim(formattedProof, claimAmount);
    await tx.wait();

    console.log("✅ Airdrop claimed successfully!");
  } catch (error) {
    console.error("❌ Claim failed:", error);
  }
}

claimAirdrop().catch(console.error);
