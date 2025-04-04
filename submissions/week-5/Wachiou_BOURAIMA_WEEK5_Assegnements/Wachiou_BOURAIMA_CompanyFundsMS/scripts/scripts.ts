import { ethers } from "hardhat";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";

async function main() {

    console.log("-----------------------Deploy Contract---------------\n\n");

    let members = 21;
    let boardMembers = [];
    let noBoardMembers = [];
    const [owner, ...Members] = await ethers.getSigners();
    boardMembers[0] = owner;
    for (let i = 1; i < 20; i++) {

        boardMembers.push(Members[i]);
        if (i == 20) {

            noBoardMembers.push(Members[i]);

        }
    }

    
    const token = await ethers.deployContract("ERC20Token", ["TestToken", "TTK", ethers.parseEther("1000000")]);

    await token.waitForDeployment();

    console.log(`Token deployed at: ${token.target}`);

    const elements = boardMembers.map(member =>
        keccak256(ethers.solidityPacked(["address"], [member.address]))
    );
    const merkleTree = new MerkleTree(elements, keccak256, { sortPairs: true });
    const merkleRoot = merkleTree.getHexRoot();

    console.log(`Merkle root: ${merkleRoot}`);


    const CompanyFundsMS = await ethers.deployContract("CompanyFundsMS", [token.target, merkleRoot]);
    await CompanyFundsMS.waitForDeployment();
   

    console.log(`Contract deployed at: ${CompanyFundsMS.target}`);

    console.log("-----------------------Test Create Expenses---------------\n\n");

   
    const expenseAmount = ethers.parseEther("500");
    const expenseDate = (Date.now()) + 86400; 
    const expenseDescription = "Office rent";
    await CompanyFundsMS.connect(owner).setMonthlyBudget(ethers.parseEther("1000"));
    let leaf = keccak256(ethers.solidityPacked(["address"], [owner.address]));
    let proof = merkleTree.getHexProof(leaf);
    const createTx = await CompanyFundsMS.connect(owner).createExpenses(
        proof,
        expenseAmount,
        expenseDate,
        expenseDescription
    );
    await createTx.wait();
    console.log("Expense created successfully");
    console.log(createTx);

    console.log("-----------------------Test Sign Expenses---------------\n\n");

   
    const expenseId = 1;
    for (const member of boardMembers) {
        const leaf = keccak256(ethers.solidityPacked(["address"], [member.address]));
        const proof = merkleTree.getHexProof(leaf);
        const signTx = await CompanyFundsMS.connect(member).signExpenses(proof, expenseId);
        await signTx.wait();
        console.log(`${member.address} signed expense ${expenseId}`);
    }

    console.log("-----------------------Test Claim Expenses---------------\n\n");

    await token.transfer(CompanyFundsMS.target, expenseAmount);
    const claimTx = await CompanyFundsMS.connect(owner).claimExpenses(expenseId);
    await claimTx.wait();
    console.log("Expense claimed successfully");



    console.log("-----------------------Test Set Monthly Budget---------------\n\n");

    const newMonthlyBudget = ethers.parseEther("500");
    const setBudgetTx = await CompanyFundsMS.connect(owner).setMonthlyBudget(newMonthlyBudget);
    await setBudgetTx.wait();
    console.log(`Monthly budget set to ${newMonthlyBudget}`);

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
