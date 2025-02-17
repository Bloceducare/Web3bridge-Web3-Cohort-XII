import { ethers } from "hardhat";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`🚀 Deploying BoardFundManager with account: ${deployer.address}`);

  const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS!;
  const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS!;

  const factory = await ethers.getContractAt("BoardFundManagerFactory", FACTORY_ADDRESS);

  const boardMembers = [
    "0xAf50C37C8B4534670cfE2099ff205c1a0Df88D3d",
    "0x6D2Dd04bF065c8A6ee9CeC97588AbB0f967E0df9",
    "0x1234567890abcdef1234567890abcdef12345678",
    "0x9876543210abcdef9876543210abcdef98765432",
    "0x00112233445566778899aabbccddeeff00112233",
    "0x445566778899aabbccddeeff0011223344556677",
    "0xA1B2C3D4E5F6789012345678901234567890A1B2",
    "0xC1D2E3F456789012345678901234567890123456",
    "0x5555555555555555555555555555555555555555",
    "0x6666666666666666666666666666666666666666",
    "0x7777777777777777777777777777777777777777",
    "0x8888888888888888888888888888888888888888",
    "0x9999999999999999999999999999999999999999",
    "0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    "0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
    "0xCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC",
    "0xDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD",
    "0xEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE",
    "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
    "0x1234512345123451234512345123451234512345"
  ];

  console.log("📌 Creating BoardFundManager...");
  const tx = await factory.createFundManager(boardMembers, TOKEN_ADDRESS);
  await tx.wait();

  // Get the latest deployed fund manager
  const deployedContracts = await factory.getDeployedFunds();
  console.log(`✅ BoardFundManager deployed at: ${deployedContracts[deployedContracts.length - 1]}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
