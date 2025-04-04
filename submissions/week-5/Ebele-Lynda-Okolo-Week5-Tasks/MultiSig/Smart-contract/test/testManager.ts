import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer, Contract } from "ethers";
import fs from "fs";
import { Multisig } from "../typechain-types";

interface Account {
    address: string;
    privateKey: string;
}

interface AccountsData {
    owner: Account;
    signers: Account[];
    recipient: Account;
    allAddresses: string[];
    allPrivateKeys: string[];
}

describe("Multisig", function () {
    let multisig: Multisig;
    let owner: Signer;
    let signers: Signer[];
    let recipient: Signer;
    const TOKEN_ADDRESS = "0x0000000000000000000000000000000000000001"; // Test token address

    let accounts: AccountsData;

    before(async function() {
        // Load the accounts from the JSON file
        const accountsJson = fs.readFileSync("accounts.json", "utf-8");
        accounts = JSON.parse(accountsJson);

        // Verify we have the correct number of signers
        if (accounts.signers.length !== 20) {
            throw new Error(`Invalid number of signers: ${accounts.signers.length}. Expected: 20`);
        }
    });

    beforeEach(async function () {
        // Create signers from private keys
        const provider = ethers.provider;
        owner = new ethers.Wallet(accounts.owner.privateKey, provider);
        signers = accounts.signers.map(signer => 
            new ethers.Wallet(signer.privateKey, provider)
        );
        recipient = new ethers.Wallet(accounts.recipient.privateKey, provider);

        // Get the signer addresses
        const signerAddresses = accounts.signers.map(signer => signer.address);

        // Deploy the contract
        const MultisigFactory = await ethers.getContractFactory("Multisig", owner);
        multisig = await MultisigFactory.deploy(
            signerAddresses,
            TOKEN_ADDRESS
        ) as Multisig;

        const multisigAddress = await multisig.getAddress();
        console.log("Multisig deployed to:", multisigAddress);
    });

    describe("Deployment", function () {
        it("Should deploy successfully with correct token address", async function () {
            expect(await multisig.token()).to.equal(TOKEN_ADDRESS);
        });

        it("Should set correct number of signers", async function () {
            // Check first and last signer
            expect(await multisig.isValidSigner(accounts.signers[0].address)).to.be.true;
            expect(await multisig.isValidSigner(accounts.signers[19].address)).to.be.true;
        });

        it("Should reject non-signers", async function () {
            expect(await multisig.isValidSigner(accounts.recipient.address)).to.be.false;
        });
    });

    describe("Budget Creation", function () {
        it("Should allow a valid signer to create budget", async function () {
            const amount = ethers.parseEther("1000");
            const signer = signers[0];
            
            const tx = await multisig.connect(signer).createBudget(
                amount,
                "Test Budget",
                accounts.recipient.address
            );

            await tx.wait();

            const budget = await multisig.getBudgetDetails(0);
            expect(budget.amount).to.equal(amount);
            expect(budget.proposal).to.equal("Test Budget");
            expect(budget.recipient).to.equal(accounts.recipient.address);
        });

        it("Should reject budget creation from non-signer", async function () {
            const amount = ethers.parseEther("1000");
            await expect(
                multisig.connect(recipient).createBudget(
                    amount,
                    "Test Budget",
                    accounts.recipient.address
                )
            ).to.be.revertedWithCustomError(multisig, "NotAuthorizedSigner");
        });
    });

    describe("Budget Approval", function () {
        let budgetId: number;

        beforeEach(async function () {
            const amount = ethers.parseEther("1000");
            const tx = await multisig.connect(signers[0]).createBudget(
                amount,
                "Test Budget",
                accounts.recipient.address
            );
            await tx.wait();
            budgetId = 0;

            // Advance time by 30 days
            await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
            await ethers.provider.send("evm_mine", []);
        });

        it("Should allow valid signer to approve budget", async function () {
            await multisig.connect(signers[0]).approveBudget(budgetId);
            expect(await multisig.hasApproved(budgetId, accounts.signers[0].address)).to.be.true;
        });

        it("Should execute budget after all approvals", async function () {
            // Get approvals from all signers
            for (const signer of signers) {
                await multisig.connect(signer).approveBudget(budgetId);
            }

            const budget = await multisig.getBudgetDetails(budgetId);
            expect(budget.executed).to.be.true;
        });
    });
});