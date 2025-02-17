import { ethers } from "hardhat";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const FUND_ADDRESS = "0x260e686A7D3b40bE4508595710d7D22C7697805b"; 
  const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS!;

  const token = await ethers.getContractAt("IERC20", TOKEN_ADDRESS);
  const balance = await token.balanceOf(FUND_ADDRESS);

  console.log(`💰 Fund Contract Balance: ${ethers.formatUnits(balance, 18)} tokens`);
}

main().catch(console.error);
