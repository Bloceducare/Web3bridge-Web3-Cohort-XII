import { ethers } from "hardhat";

async function main() {
    const [owner, ...boardMembers] = await ethers.getSigners();
    const companyFunds = await ethers.getContractAt("CompanyFunds", "0x..."); // Replace with deployed contract address

    // Example: Adding signatures
    for (let i = 0; i < boardMembers.length; i++) {
        await companyFunds.connect(boardMembers[i]).signBudget();
    }

    // Release funds if all signed
    const recipient = "0x..."; // Replace with recipient address
    const amount = ethers.utils.parseEther("1"); // Example amount
    await companyFunds.releaseFunds(recipient, amount);
    console.log("Funds released to:", recipient);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });