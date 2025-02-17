const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

// Helper function to deploy contracts
async function deployContracts() {
    // Deploy MyToken Contract
    const MyToken = await ethers.getContractFactory("MyToken");
    const myToken = await MyToken.deploy("MyToken", "MTK", 1000); // Name, Symbol, Total Supply (1000 tokens)
    await myToken.waitForDeployment(); // Ensure the contract is fully deployed

    // Get Signers
    const [owner, user1, user2] = await ethers.getSigners();

    return { myToken, owner, user1, user2 };
}

describe("MyToken", function () {
    describe("Deployment", function () {
        it("should set the correct token details during deployment", async function () {
            const { myToken } = await loadFixture(deployContracts);
            expect(await myToken.name()).to.equal("MyToken");
            expect(await myToken.symbol()).to.equal("MTK");
            expect(await myToken.decimals()).to.equal(18);
            expect(await myToken.totalSupply()).to.equal(ethers.parseUnits("1000", 18)); // 1000 tokens with 18 decimals
        });

        it("should assign all tokens to the deployer during deployment", async function () {
            const { myToken, owner } = await loadFixture(deployContracts);
            const totalSupply = await myToken.totalSupply();
            const ownerBalance = await myToken.balanceOf(owner.address);
            expect(ownerBalance).to.equal(totalSupply);
        });
    });

    describe("Transfers", function () {
        it("should allow the owner to transfer tokens to another address", async function () {
            const { myToken, owner, user1 } = await loadFixture(deployContracts);

            const transferAmount = ethers.parseUnits("100", 18); // 100 tokens
            await myToken.connect(owner).transfer(user1.address, transferAmount);

            const user1Balance = await myToken.balanceOf(user1.address);
            const ownerBalance = await myToken.balanceOf(owner.address);

            expect(user1Balance).to.equal(transferAmount);
            expect(ownerBalance).to.equal(ethers.parseUnits("900", 18)); // Owner balance should decrease
        });

        it("should reject transfers if the sender does not have enough balance", async function () {
            const { myToken, user1, user2 } = await loadFixture(deployContracts);

            const invalidTransferAmount = ethers.parseUnits("100", 18); // User1 has no tokens
            await expect(
                myToken.connect(user1).transfer(user2.address, invalidTransferAmount)
            ).to.be.revertedWith("Insufficient balance");
        });

        it("should emit a Transfer event on successful transfer", async function () {
            const { myToken, owner, user1 } = await loadFixture(deployContracts);

            const transferAmount = ethers.parseUnits("100", 18); // 100 tokens
            await expect(
                myToken.connect(owner).transfer(user1.address, transferAmount)
            )
                .to.emit(myToken, "Transfer")
                .withArgs(owner.address, user1.address, transferAmount);
        });
    });

    describe("Approvals", function () {
        it("should allow an address to approve another address to spend tokens on its behalf", async function () {
            const { myToken, owner, user1 } = await loadFixture(deployContracts);

            const approveAmount = ethers.parseUnits("500", 18); // 500 tokens
            await myToken.connect(owner).approve(user1.address, approveAmount);

            const allowance = await myToken.allowance(owner.address, user1.address);
            expect(allowance).to.equal(approveAmount);
        });

        it("should reject approvals if the spender address is zero", async function () {
            const { myToken, owner } = await loadFixture(deployContracts);

            const invalidSpender = ethers.ZeroAddress;
            const approveAmount = ethers.parseUnits("500", 18); // 500 tokens
            await expect(
                myToken.connect(owner).approve(invalidSpender, approveAmount)
            ).to.be.revertedWith("Invalid address");
        });

        it("should emit an Approval event on successful approval", async function () {
            const { myToken, owner, user1 } = await loadFixture(deployContracts);

            const approveAmount = ethers.parseUnits("500", 18); // 500 tokens
            await expect(
                myToken.connect(owner).approve(user1.address, approveAmount)
            )
                .to.emit(myToken, "Approval")
                .withArgs(owner.address, user1.address, approveAmount);
        });
    });

    describe("Transfer From", function () {
        it("should allow approved addresses to transfer tokens on behalf of the owner", async function () {
            const { myToken, owner, user1, user2 } = await loadFixture(deployContracts);
    
            const approveAmount = ethers.parseUnits("500", 18); // Approve 500 tokens
            await myToken.connect(owner).approve(user1.address, approveAmount);
    
            const transferAmount = ethers.parseUnits("300", 18); // Transfer 300 tokens
            await myToken.connect(user1).transferFrom(owner.address, user2.address, transferAmount);
    
            const user2Balance = await myToken.balanceOf(user2.address);
            const remainingAllowance = await myToken.allowance(owner.address, user1.address);
    
            expect(user2Balance).to.equal(transferAmount);
            expect(remainingAllowance).to.equal(approveAmount - transferAmount);
        });
    
        it("should reject transfers if the sender does not have enough allowance", async function () {
            const { myToken, owner, user1, user2 } = await loadFixture(deployContracts);
    
            const approveAmount = ethers.parseUnits("500", 18); // Approve 500 tokens
            await myToken.connect(owner).approve(user1.address, approveAmount);
    
            const invalidTransferAmount = ethers.parseUnits("600", 18); // Exceeds allowance
            await expect(
                myToken.connect(user1).transferFrom(owner.address, user2.address, invalidTransferAmount)
            ).to.be.revertedWith("Allowance exceeded");
        });
    
        it("should reject transfers if the sender does not have enough balance", async function () {
            const { myToken, owner, user1, user2 } = await loadFixture(deployContracts);
    
            const approveAmount = ethers.parseUnits("500", 18); // Approve 500 tokens
            await myToken.connect(owner).approve(user1.address, approveAmount);
    
            const transferAmount = ethers.parseUnits("500", 18); // Transfer the full approved amount
            await myToken.connect(user1).transferFrom(owner.address, user2.address, transferAmount);
    
            const invalidTransferAmount = ethers.parseUnits("1000", 18); // Exceeds owner's balance
            await expect(
                myToken.connect(user1).transferFrom(owner.address, user2.address, invalidTransferAmount)
            ).to.be.revertedWith("Insufficient balance");
        });
    
        it("should emit a Transfer event on successful transferFrom", async function () {
            const { myToken, owner, user1, user2 } = await loadFixture(deployContracts);
    
            const approveAmount = ethers.parseUnits("500", 18); // Approve 500 tokens
            await myToken.connect(owner).approve(user1.address, approveAmount);
    
            const transferAmount = ethers.parseUnits("300", 18); // Transfer 300 tokens
            await expect(
                myToken.connect(user1).transferFrom(owner.address, user2.address, transferAmount)
            )
                .to.emit(myToken, "Transfer")
                .withArgs(owner.address, user2.address, transferAmount);
        });
    });
});