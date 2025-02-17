import { ethers } from "ethers";
import fs from "fs";
import path from "path";

// Read the contract artifact
const contractPath = path.join(__dirname, "../artifacts/contracts/Multisig.sol/Multisig.json");
const TOKEN_ADDRESS = "0xYourTokenAddress"; // Replace with your token address

async function main() {
    console.log("🔍 Loading accounts from accounts.json...");
    
    // Load accounts
    let wallets: any[];
    try {
        wallets = JSON.parse(fs.readFileSync("accounts.json", "utf8"));
    } catch (error) {
        throw new Error("❌ accounts.json not found! Run `npx hardhat run scripts/generateAccounts.ts` first.");
    }

    if (wallets.length < 20) {
        throw new Error(`❌ Only ${wallets.length} signers available. Need 20.`);
    }

    try {
        // Create provider
        const provider = new ethers.JsonRpcProvider("https://rpc.sepolia-api.lisk.com");
        
        // Create wallet
        const deployerWallet = new ethers.Wallet(wallets[0].privateKey, provider);
        console.log("🚀 Using deployer:", await deployerWallet.getAddress());

        // Get contract artifacts
        const contractArtifact = JSON.parse(fs.readFileSync(contractPath, "utf8"));
        
        // Format addresses
        const signerAddresses = wallets
            .slice(0, 20)
            .map(wallet => ethers.getAddress(wallet.address));

        console.log("🚀 Deploying Multisig contract...");
        
        // Create contract factory
        const factory = new ethers.ContractFactory(
            contractArtifact.abi,
            contractArtifact.bytecode,
            deployerWallet
        );

        // Deploy with explicit parameters
        const contract = await factory.deploy(
            signerAddresses,
            TOKEN_ADDRESS,
            {
                gasLimit: 5000000
            }
        );

        console.log("📝 Transaction Hash:", contract.deploymentTransaction()?.hash);
        
        // Wait for deployment
        await contract.waitForDeployment();
        const contractAddress = await contract.getAddress();
        
        console.log("✅ Contract deployed to:", contractAddress);

        // Save deployment info
        const deployments = {
            multisig: contractAddress,
            token: TOKEN_ADDRESS,
            signers: signerAddresses,
            network: "lisk-sepolia",
            deploymentTx: contract.deploymentTransaction()?.hash
        };

        fs.writeFileSync("deployments.json", JSON.stringify(deployments, null, 2));
        console.log("📂 Deployment addresses saved to deployments.json");

    } catch (error) {
        console.error("❌ Deployment failed:", error);
        throw error;
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment Error:", error);
        process.exit(1);
    });