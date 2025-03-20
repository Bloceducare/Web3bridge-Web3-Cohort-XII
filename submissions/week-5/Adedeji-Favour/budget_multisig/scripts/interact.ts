import { ethers } from "hardhat";
require("dotenv").config();

async function main() {
    // const provider = new ethers.JsonRpcProvider(process.env.URL_KEY || "http://127.0.0.1:8545");
    // const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const abi = [
        "function proposeBudget(uint256 _amount) external",
        "function signBudget() external",
        "function depositFunds() external payable",
        "function getBudgetStatus() external view returns (uint256, uint256, bool)",
        "function fundsReleased() external view returns (bool)"
    ];

    const contract = await ethers.getContractAt("BudgetMultiSig", contractAddress);

    console.log("Connected to contract at:", contractAddress);
    
    // 1. Propose a budget
    const budgetAmount = ethers.parseUnits("10000", "wei");
    console.log("Proposing budget:", budgetAmount.toString());
    let tx = await contract.proposeBudget(budgetAmount);
    await tx.wait();
    console.log("Budget proposed!");
    
    const signers = await ethers.getSigners();
    
    // 2. Sign the budget (Simulating multiple signers)
    for (let i = 0; i < 20; i++) {
        const tx = await contract.connect(signers[i]).signBudget();
        await tx.wait();
        console.log(`Board member ${i + 1} signed`);
    }

    // 3. Deposit funds    
    tx = await contract.connect(signers[0]).depositFunds({ value: ethers.parseEther("0.001") });
    await tx.wait();
    console.log("0.001 ETH deposited to the contract!");

    // 4. Get budget status
    const [amount, approvals, releasedStatus] = await contract.connect(signers[1]).getBudgetStatus(); 
    console.log(`Budget Amount: ${amount.toString()}, Approvals: ${approvals.toString()}, Is Funds Released ?: ${releasedStatus}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
