import { ethers } from "hardhat";

async function main() {
  const [user] = await ethers.getSigners();
  const simpleSwapAddress = "YOUR_SIMPLE_SWAP_ADDRESS"; // Replace with deployed address
  const SimpleSwap = await ethers.getContractFactory("SimpleSwap");
  const simpleSwap = SimpleSwap.attach(simpleSwapAddress);

  const amountIn = ethers.utils.parseEther("10");
  console.log("Attempting to swap tokens...");
  const amountOut = await simpleSwap.connect(user).swap(amountIn, true);
  console.log(
    "Swapped",
    ethers.utils.formatEther(amountIn),
    "TokenX for",
    ethers.utils.formatEther(amountOut),
    "TokenY"
  );

  const price = await simpleSwap.getPrice();
  console.log("Current price ratio:", ethers.utils.formatEther(price));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});