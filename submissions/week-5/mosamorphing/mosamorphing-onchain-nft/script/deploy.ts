import { ethers } from "hardhat";

async function main() {
  const YosemiteNftFactory = await ethers.getContractFactory("YosemiteNft");
  const yosemiteNft = await YosemiteNftFactory.deploy();

  await yosemiteNft.deployed();

  console.log("YosemiteNft deployed to:", yosemiteNft.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});