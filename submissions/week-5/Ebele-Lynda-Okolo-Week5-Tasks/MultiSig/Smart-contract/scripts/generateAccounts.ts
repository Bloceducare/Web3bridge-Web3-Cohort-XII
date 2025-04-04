import { Wallet, ethers } from "ethers";
import fs from "fs";

interface Account {
    address: string;
    privateKey: string;
}

async function main() {
    const wallets: Account[] = [];
    
    // Generate 22 wallets (20 signers + owner + recipient)
    for (let i = 0; i < 22; i++) {
        const wallet = Wallet.createRandom();
        wallets.push({
            address: wallet.address,
            privateKey: wallet.privateKey,
        });
    }

    // Create accounts object with labeled roles
    const accounts = {
        owner: wallets[0],
        signers: wallets.slice(1, 21),  // 20 signers
        recipient: wallets[21],
        allAddresses: wallets.map(w => w.address),
        allPrivateKeys: wallets.map(w => w.privateKey)
    };

    // Save to a file
    fs.writeFileSync(
        "accounts.json", 
        JSON.stringify(accounts, null, 2)
    );

    console.log("✅ Accounts Generated!");
    console.log(`Owner Address: ${accounts.owner.address}`);
    console.log(`Number of Signers: ${accounts.signers.length}`);
    console.log(`Recipient Address: ${accounts.recipient.address}`);
}

main().catch((error) => {
    console.error("❌ Error generating accounts:", error);
    process.exit(1);
});