const hre = require("hardhat");

async function main() {
  const LibraryContract = await hre.ethers.getContractFactory("LibraryManagement");
  // Pass the library name to the constructor
  const libraryName = "My Decentralized Library";
  const library = await LibraryContract.deploy(libraryName);

  await library.deployed();
  console.log("LibraryManagement deployed to:", library.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

