const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("CompanyMultiSigners", function () {
    async function deployContractFixture() {
        const signers = await ethers.getSigners();
        const boardMembers = signers.slice(0, 20).map(signer => signer.address);
        
        // Deploy the ERC20 token
        const CompanyToken = await ethers.getContractFactory("CompanyToken");
        const token = await CompanyToken.deploy();
        
        // Deploy the MultiSigners contract
        const CompanyMultiSigners = await ethers.getContractFactory("CompanyMultiSigners");
        const requiredSignatures = 20;
        const multiSig = await CompanyMultiSigners.deploy(
            boardMembers, 
            requiredSignatures, 
            await token.getAddress()
        );

        // Transfer tokens to the multisig contract
        const amount = ethers.parseEther("10000");
        await token.approve(await multiSig.getAddress(), amount);
        await multiSig.depositFunds(amount);

        return { 
            multiSig, 
            token, 
            boardMembers,
            signers: signers.slice(0, 20), // Board member signers
            requiredSignatures
        };
    }

    describe("Deployment", function () {
        it("Should correctly initialize with 20 board members", async function () {
            const { multiSig, boardMembers, requiredSignatures } = await loadFixture(deployContractFixture);
            
            // Verify each board member
            for (const member of boardMembers) {
                expect(await multiSig.isBoardMember(member)).to.be.true;
            }
            expect(await multiSig.requiredSignatures()).to.equal(requiredSignatures);
        });
    });

    describe("Budget Creation and Progressive Signing", function () {
        it("Should create and track a new budget", async function () {
            const { multiSig, signers } = await loadFixture(deployContractFixture);
            
            await multiSig.createBudget(
                "Annual Budget",
                "Company-wide annual budget allocation",
                ethers.parseEther("1000"),
                signers[0].address // Using first signer as recipient
            );

            const budget = await multiSig.budgets(0);
            expect(budget.name).to.equal("Annual Budget");
            expect(budget.amount).to.equal(ethers.parseEther("1000"));
            expect(budget.signedCount).to.equal(0);
            expect(budget.isReleased).to.be.false;
        });

        it("Should allow all 20 board members to sign sequentially", async function () {
            const { multiSig, signers } = await loadFixture(deployContractFixture);
            
            // Create budget
            await multiSig.createBudget(
                "Annual Budget",
                "Company-wide annual budget allocation",
                ethers.parseEther("1000"),
                signers[0].address
            );

            // Have each board member sign
            for (let i = 0; i < 20; i++) {
                await multiSig.connect(signers[i]).signBudget(0);
                expect(await multiSig.getSignedCount(0)).to.equal(i + 1);
            }
        });

        it("Should not release funds until all 20 signatures are collected", async function () {
            const { multiSig, signers } = await loadFixture(deployContractFixture);
            
            await multiSig.createBudget(
                "Annual Budget",
                "Company-wide annual budget allocation",
                ethers.parseEther("1000"),
                signers[0].address
            );

            // Have 19 members sign
            for (let i = 0; i < 19; i++) {
                await multiSig.connect(signers[i]).signBudget(0);
            }

            // Attempt to release funds with 19 signatures should fail
            await expect(multiSig.releaseFunds(0))
                .to.be.revertedWithCustomError(multiSig, "BudgetNotFullySigned");
        });
    });

    describe("Complete Budget Lifecycle", function () {
        it("Should successfully release funds after all 20 signatures", async function () {
            const { multiSig, signers, token } = await loadFixture(deployContractFixture);
            const recipient = signers[0];
            
            await multiSig.createBudget(
                "Annual Budget",
                "Company-wide annual budget allocation",
                ethers.parseEther("1000"),
                recipient.address
            );

            // Collect all 20 signatures
            for (const signer of signers) {
                await multiSig.connect(signer).signBudget(0);
            }

            const balanceBefore = await token.balanceOf(recipient.address);
            await multiSig.releaseFunds(0);

            expect(await token.balanceOf(recipient.address))
                .to.equal(balanceBefore + ethers.parseEther("1000"));
        });

        it("Should handle multiple budgets with different signers", async function () {
            const { multiSig, signers } = await loadFixture(deployContractFixture);
            
            // Create two different budgets
            await multiSig.createBudget(
                "Budget 1",
                "First budget",
                ethers.parseEther("500"),
                signers[0].address
            );
            
            await multiSig.createBudget(
                "Budget 2",
                "Second budget",
                ethers.parseEther("300"),
                signers[1].address
            );

            // Have different combinations of signers sign each budget
            for (let i = 0; i < 20; i++) {
                await multiSig.connect(signers[i]).signBudget(0);
                if (i < 10) { // Only sign budget 2 with first 10 signers
                    await multiSig.connect(signers[i]).signBudget(1);
                }
            }

            // First budget should be releasable
            await multiSig.releaseFunds(0);

            // Second budget should not be releasable
            await expect(multiSig.releaseFunds(1))
                .to.be.revertedWithCustomError(multiSig, "BudgetNotFullySigned");
        });
    });

    describe("Edge Cases and Security", function () {
        it("Should prevent duplicate signatures", async function () {
            const { multiSig, signers } = await loadFixture(deployContractFixture);
            
            await multiSig.createBudget(
                "Test Budget",
                "Test description",
                ethers.parseEther("100"),
                signers[0].address
            );
    
            await multiSig.connect(signers[0]).signBudget(0);
            await expect(multiSig.connect(signers[0]).signBudget(0))
                .to.be.revertedWithCustomError(multiSig, "BudgetAlreadySigned");
        });
    
        // Alternative test for budget creation validation
        it("Should create budget with valid parameters", async function () {
            const { multiSig, signers } = await loadFixture(deployContractFixture);
            
            await multiSig.createBudget(
                "Valid Budget",
                "Budget with valid recipient",
                ethers.parseEther("100"),
                signers[0].address
            );
    
            const budget = await multiSig.budgets(0);
            expect(budget.name).to.equal("Valid Budget");
            expect(budget.amount).to.equal(ethers.parseEther("100"));
            expect(budget.recipient).to.equal(signers[0].address);
        });
    });
});