import { ethers } from "hardhat";
import fs from 'fs';
import { merkleRoot, logMerkleInfo } from "./merkleRoot";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    // Deploy Token
    console.log("\nDeploying DripToken...");
    const DripToken = await ethers.getContractFactory("DripToken");
    const token = await DripToken.deploy();
    await token.waitForDeployment();
    const tokenAddress = await token.getAddress();
    console.log("DripToken deployed to:", tokenAddress);

    // Deploy Airdrop with merkle root
    console.log("\nDeploying Airdrop...");
    const Airdrop = await ethers.getContractFactory("Airdrop");
    const airdrop = await Airdrop.deploy(tokenAddress, merkleRoot);
    await airdrop.waitForDeployment();
    const airdropAddress = await airdrop.getAddress();
    console.log("Airdrop deployed to:", airdropAddress);

    // Fund Airdrop contract
    console.log("\nFunding Airdrop contract...");
    const airdropAmount = ethers.parseEther("1000"); // 1000 tokens
    const fundTx = await token.transfer(airdropAddress, airdropAmount);
    await fundTx.wait();
    
    // Verify funding
    const airdropBalance = await token.balanceOf(airdropAddress);
    console.log("Airdrop contract balance:", ethers.formatEther(airdropBalance), "tokens");

    // Save deployment info
    const deploymentInfo = {
        tokenAddress,
        airdropAddress,
        merkleRoot,
        network: network.name,
        timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync(
        'deployment-info.json',
        JSON.stringify(deploymentInfo, null, 2)
    );
    
    // Log merkle information
    logMerkleInfo();
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });