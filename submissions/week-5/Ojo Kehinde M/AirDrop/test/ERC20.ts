import {
    time,
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";
import { Token } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("Token", function () {
    async function deployTokenFixture() {
        const [owner, addr1, addr2] = await hre.ethers.getSigners();

        const Token = await hre.ethers.getContractFactory("Token");
        const token = await Token.deploy();

        return { token, owner, addr1, addr2 };
    }

    describe("Deployment", function () {
        it("Should set the right name and symbol", async function () {
            const { token } = await loadFixture(deployTokenFixture);

            expect(await token.name()).to.equal("Cohort XII Token");
            expect(await token.symbol()).to.equal("CXII");
        });

        it("Should mint initial supply to deployer", async function () {
            const { token, owner } = await loadFixture(deployTokenFixture);
            const expectedSupply = hre.ethers.parseEther("10000000"); // 10M tokens with 18 decimals

            expect(await token.totalSupply()).to.equal(expectedSupply);
            expect(await token.balanceOf(owner.address)).to.equal(expectedSupply);
        });
    });

    describe("Minting", function () {
        it("Should allow minting to any address", async function () {
            const { token, addr1 } = await loadFixture(deployTokenFixture);
            const mintAmount = hre.ethers.parseEther("1000"); // 1000 tokens

            await expect(token.mint(addr1.address, mintAmount))
                .to.emit(token, "Transfer")
                .withArgs(hre.ethers.ZeroAddress, addr1.address, mintAmount);

            expect(await token.balanceOf(addr1.address)).to.equal(mintAmount);
        });

        it("Should update total supply after minting", async function () {
            const { token, addr1 } = await loadFixture(deployTokenFixture);
            const initialSupply = await token.totalSupply();
            const mintAmount = hre.ethers.parseEther("1000");

            await token.mint(addr1.address, mintAmount);

            expect(await token.totalSupply()).to.equal(initialSupply + mintAmount);
        });

        it("Should allow minting zero tokens", async function () {
            const { token, addr1 } = await loadFixture(deployTokenFixture);

            await expect(token.mint(addr1.address, 0))
                .to.emit(token, "Transfer")
                .withArgs(hre.ethers.ZeroAddress, addr1.address, 0);
        });

        it("Should handle multiple mints to same address", async function () {
            const { token, addr1 } = await loadFixture(deployTokenFixture);
            const mintAmount = hre.ethers.parseEther("1000");

            await token.mint(addr1.address, mintAmount);
            await token.mint(addr1.address, mintAmount);

            expect(await token.balanceOf(addr1.address)).to.equal(mintAmount * 2n);
        });

        it("Should allow anyone to mint", async function () {
            const { token, addr1, addr2 } = await loadFixture(deployTokenFixture);
            const mintAmount = hre.ethers.parseEther("1000");

            await token.connect(addr1).mint(addr2.address, mintAmount);
            expect(await token.balanceOf(addr2.address)).to.equal(mintAmount);
        });
    });

    describe("Standard ERC20 Functionality", function () {
        it("Should allow transfers between accounts", async function () {
            const { token, owner, addr1 } = await loadFixture(deployTokenFixture);
            const transferAmount = hre.ethers.parseEther("1000");

            await expect(token.transfer(addr1.address, transferAmount))
                .to.emit(token, "Transfer")
                .withArgs(owner.address, addr1.address, transferAmount);

            expect(await token.balanceOf(addr1.address)).to.equal(transferAmount);
        });

        it("Should handle allowances correctly", async function () {
            const { token, owner, addr1, addr2 } = await loadFixture(deployTokenFixture);
            const approvalAmount = hre.ethers.parseEther("1000");

            await expect(token.approve(addr1.address, approvalAmount))
                .to.emit(token, "Approval")
                .withArgs(owner.address, addr1.address, approvalAmount);

            expect(await token.allowance(owner.address, addr1.address))
                .to.equal(approvalAmount);
        });

        it("Should handle transferFrom correctly", async function () {
            const { token, owner, addr1, addr2 } = await loadFixture(deployTokenFixture);
            const transferAmount = hre.ethers.parseEther("1000");

            await token.approve(addr1.address, transferAmount);
            
            await expect(token.connect(addr1).transferFrom(owner.address, addr2.address, transferAmount))
                .to.emit(token, "Transfer")
                .withArgs(owner.address, addr2.address, transferAmount);

            expect(await token.balanceOf(addr2.address)).to.equal(transferAmount);
            expect(await token.allowance(owner.address, addr1.address)).to.equal(0);
        });

        it("Should fail when transferring more than balance", async function () {
            const { token, owner, addr1 } = await loadFixture(deployTokenFixture);
            const totalSupply = await token.totalSupply();

            await expect(token.transfer(addr1.address, totalSupply + 1n))
                .to.be.revertedWithCustomError(token, "ERC20InsufficientBalance");
        });

        it("Should fail when spending more than allowance", async function () {
            const { token, owner, addr1, addr2 } = await loadFixture(deployTokenFixture);
            const approvalAmount = hre.ethers.parseEther("1000");

            await token.approve(addr1.address, approvalAmount);

            await expect(token.connect(addr1).transferFrom(owner.address, addr2.address, approvalAmount + 1n))
                .to.be.revertedWithCustomError(token, "ERC20InsufficientAllowance");
        });
    });
});