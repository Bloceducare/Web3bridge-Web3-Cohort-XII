import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("🚀 Deploying contract with account:", deployer.address);

        // Define token parameters
    const tokenName = "CeCe"; 
    const tokenSymbol = "CIS";
    const initialSupply = ethers.parseUnits("1000000", 18); 

            // Get the contract factory and deploy with parameters
    const CECE = await ethers.getContractFactory("CECE");
    const cece = await CECE.deploy(tokenName, tokenSymbol, initialSupply);

    await cece.waitForDeployment();

    console.log("CECE deployed to:", await cece.getAddress());

    console.log("✅ CECE deployed to:", await cece.getAddress());
    console.log("📌 Token Name:", await cece.name());
    console.log("📌 Token Symbol:", await cece.symbol());
    console.log("📌 Total Supply:", (await cece.totalSupply()).toString());
}

// Handle errors
main().catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exitCode = 1;
});
