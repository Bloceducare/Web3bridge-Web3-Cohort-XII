import { ethers as hardhatEthers } from "hardhat";
import { parseEther, formatEther, Interface, LogDescription } from "ethers";
import { Multisig } from "../typechain-types";
import { IERC20 } from "../typechain-types";
import fs from "fs";

interface Deployments {
    multisig: string;
    token: string;
    signers: string[];
    network: string;
}

async function main() {
    // Load deployment addresses
    const deployments: Deployments = JSON.parse(
        fs.readFileSync("deployments.json", "utf8")
    );

    // Connect to deployed contracts using Hardhat's `ethers`
    const multisig = await hardhatEthers.getContractAt(
        "Multisig",
        deployments.multisig
    ) as Multisig;

    const token = await hardhatEthers.getContractAt(
        "IERC20",
        deployments.token
    ) as IERC20;

    // Get available signers
    const signers = await hardhatEthers.getSigners();
    const validSigners = signers.slice(1, 21);
    const recipient = signers[21];

    // ✅ Use .getAddress() instead of .address
    const multisigAddress = await multisig.getAddress();

    console.log("🔎 Checking contract balances...");
    const tokenBalance = await token.balanceOf(multisigAddress);
    console.log(`📊 Multisig Token Balance: ${formatEther(tokenBalance)} CFT`);

    // 🔹 Create a new budget proposal
    console.log("\n📝 Creating a new budget proposal...");
    const budgetAmount = parseEther("1000");
    const tx = await multisig.connect(validSigners[0]).createBudget(
        budgetAmount,
        "February 2025 Operating Budget",
        recipient.address
    );

    // ✅ FIX: Handle possible null receipt
    const receipt = await tx.wait();
    if (!receipt) throw new Error("🚨 Transaction receipt is null!");

    // ✅ FIX: Decode logs using contract interface
    const iface = new Interface([
        "event BudgetCreated(uint256 indexed budgetId, uint256 amount, address recipient, uint256 monthId, string proposal)"
    ]);

    let budgetId: number | undefined;
    for (const log of receipt.logs) {
        try {
            const parsedLog: LogDescription | null = iface.parseLog(log);
            if (parsedLog && parsedLog.name === "BudgetCreated") {
                budgetId = parsedLog.args.budgetId.toNumber();
                break;
            }
        } catch (error) {
            // Ignore logs that do not match the event
        }
    }

    if (budgetId === undefined) throw new Error("🚨 Budget creation event not found!");

    console.log(`✅ Budget Created! ID: ${budgetId}`);

    // 🔹 Fetch and display budget details
    console.log("\n📄 Fetching budget details...");
    const budget = await multisig.getBudgetDetails(budgetId);
    console.log(`💰 Amount: ${formatEther(budget.amount)} CFT`);
    console.log(`📋 Proposal: ${budget.proposal}`);
    console.log(`📅 Month ID: ${budget.monthId}`);
    console.log(`🔄 Executed: ${budget.executed}`);
    console.log(`👤 Recipient: ${budget.recipient}`);
    console.log(`✔️ Current Approvals: ${budget.approvalCount}`);

    // 🔹 Simulate month passing to allow approvals
    console.log("\n⏳ Simulating the end of the month...");
    await hardhatEthers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]); // 30 days
    await hardhatEthers.provider.send("evm_mine", []);

    // 🔹 Collect approvals from all valid signers
    console.log("\n✅ Collecting approvals from signers...");
    for (const signer of validSigners) {
        const hasApproved = await multisig.hasApproved(budgetId, signer.address);
        if (!hasApproved) {
            const approveTx = await multisig.connect(signer).approveBudget(budgetId);
            await approveTx.wait();
            console.log(`✔️ Approval received from: ${signer.address}`);
        }
    }

    // 🔹 Final state check
    console.log("\n🔎 Fetching final budget state...");
    const finalBudget = await multisig.getBudgetDetails(budgetId);
    console.log(`🏁 Budget Executed: ${finalBudget.executed}`);

    // 🔹 Check recipient's final balance
    const recipientBalance = await token.balanceOf(recipient.address);
    console.log(`🎉 Recipient Balance: ${formatEther(recipientBalance)} CFT`);
}

// Run the script
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error encountered:", error);
        process.exit(1);
    });
