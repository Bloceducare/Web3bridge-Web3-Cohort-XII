const hre = require("hardhat");
import { ethers } from "hardhat";
async function main() {
//   // Replace with your token name and symbol
//   const tokenName = "OurToken";
//   const tokenSymbol = "OTK";

  // Deploy the token contract
  const OurToken = await hre.ethers.getContractFactory("MyToken");
  const token = await OurToken.deploy(ethers.parseEther("1000000"));

 

  console.log("ourToken deployed to:", token.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});