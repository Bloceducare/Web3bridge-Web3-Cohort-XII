import { ethers } from "hardhat";
import { XiAirdrop } from "../typechain-types"; // Ensure correct import path

// Replace with deployed contract address
const AIRDROP_CONTRACT_ADDRESS = "0x77DAFD1e598847c6a984Ef79B7F92C33E5384Cc5"; // Update with actual deployed contract address

// Replace with new Merkle root
const NEW_MERKLE_ROOT = "0x7e519ea6ab4891ddff470d5b23f1d341c228eb05372af035fb95b11e9d2922ac"; // Update with new Merkle root hash

async function updateMerkleRoot() {
  const [owner] = await ethers.getSigners(); // Get owner wallet
  const airdropContract = await ethers.getContractAt("XiAirdrop", AIRDROP_CONTRACT_ADDRESS) as XiAirdrop;

  console.log(`Updating Merkle root to: ${NEW_MERKLE_ROOT}...`);

  try {
    const tx = await airdropContract.updateMerkleRoot(NEW_MERKLE_ROOT);
    await tx.wait();

    console.log("Merkle root updated successfully!");
  } catch (error) {
    console.error("Merkle root update failed:", error);
  }
}

updateMerkleRoot().catch(console.error);
