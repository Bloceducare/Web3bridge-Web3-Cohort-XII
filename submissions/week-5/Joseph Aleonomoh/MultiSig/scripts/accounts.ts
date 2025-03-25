import { Wallet, ethers } from "ethers";
import fs from "fs";

async function main() {
    const wallets = [];
    
    for (let i = 0; i < 20; i++) {
        const wallet = Wallet.createRandom();
        wallets.push({
            address: wallet.address,
            privateKey: wallet.privateKey,
        });
    }

    // ✅ Save to a file
    fs.writeFileSync("accounts.json", JSON.stringify(wallets, null, 2));

    console.log("✅ 20 Wallets Generated! Saved to accounts.json");
    console.log(wallets);
}

main().catch((error) => {
    console.error("❌ Error generating accounts:", error);
});