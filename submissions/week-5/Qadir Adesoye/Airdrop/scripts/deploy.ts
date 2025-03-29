import { ethers } from "hardhat";
import { AirdropToken, Airdrop } from "../typechain-types";

async function main() {
    // Get name and symbol from command line arguments
    const args = process.argv.slice(2);
    
    // Find the index of '--' separator
    const separatorIndex = args.indexOf('--');
    const scriptArgs = separatorIndex !== -1 ? args.slice(separatorIndex + 1) : args;
    
    const [name, symbol] = scriptArgs;

    if (!name || !symbol) {
        throw new Error("Please provide token name and symbol as arguments. Example: npx hardhat run --network lisk_sepolia scripts/deploy.ts -- \"Hola Airdrop\" \"HOAI\"");
    }

    console.log(`Deploying token with name: ${name} and symbol: ${symbol}`);

    // Get deployer
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    // Check deployer balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Deployer balance:", ethers.formatEther(balance), "ETH");

    // Deploy Token
    const Token = await ethers.getContractFactory("AirdropToken");
    const token = await Token.deploy(name, symbol) as AirdropToken;
    await token.waitForDeployment();
    const tokenAddress = await token.getAddress();
    console.log("Token deployed to:", tokenAddress);

    // Deploy Airdrop
    const Airdrop = await ethers.getContractFactory("Airdrop");
    const airdrop = await Airdrop.deploy(tokenAddress) as Airdrop;
    await airdrop.waitForDeployment();
    const airdropAddress = await airdrop.getAddress();
    console.log("Airdrop deployed to:", airdropAddress);

    // Transfer tokens to airdrop contract
    const transferAmount = ethers.parseEther("10000");
    await token.transfer(airdropAddress, transferAmount);
    console.log(`Transferred ${ethers.formatEther(transferAmount)} tokens to airdrop contract`);

    // Save deployment info
    console.log("\nDeployment Summary:");
    console.log("Token Address:", tokenAddress);
    console.log("Airdrop Address:", airdropAddress);
    console.log("Token Name:", name);
    console.log("Token Symbol:", symbol);
}

main().catch((error) => {
    console.error("Error during deployment:", error);
    process.exitCode = 1;
});