import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { assert } from "console";
import hre, { ethers } from "hardhat";
import { expect } from "chai";

describe("MyERC20 Token", () => {

    const tokenContract = async () => {
        const [owner, addr1, addr2] = await hre.ethers.getSigners();
        const Token = await hre.ethers.getContractFactory("MyERC20");
        const token = await Token.deploy("TestToken", 1000, 18, "TTK");
        await token.waitForDeployment();
        return { token, owner, addr1, addr2 };
    };

    describe("Deployment", () => {
        it("Should assign the total supply to contract initially", async () => {
            const { token } = await loadFixture(tokenContract);
            const balance = await token.balanceOf(token.target);
            expect(balance).to.equal(ethers.parseUnits("1000", 18));
        });
    });

    describe("Transfers", () => {
        it("Should transfer tokens successfully", async () => {
            const { token, owner, addr1 } = await loadFixture(tokenContract);
            await token.transfer(addr1.address, ethers.parseUnits("100", 18));
            const balance = await token.balanceOf(addr1.address);
            expect(balance).to.equal(ethers.parseUnits("100", 18));
        });
    });

    describe("Approvals", () => {
        it("Should approve an address to spend tokens", async () => {
            const { token, owner, addr1 } = await loadFixture(tokenContract);
            await token.approve(addr1.address, ethers.parseUnits("50", 18));
            const allowance = await token.allowance(owner.address, addr1.address);
            expect(allowance).to.equal(ethers.parseUnits("50", 18));
        });
    });

    describe("TransferFrom", () => {
        it("Should transfer tokens from an approved address", async () => {
            const { token, owner, addr1, addr2 } = await loadFixture(tokenContract);
            await token.transfer(addr1.address, ethers.parseUnits("100", 18));
            await token.connect(addr1).approve(owner.address, ethers.parseUnits("50", 18));
            await token.transferFrom(addr1.address, addr2.address, ethers.parseUnits("50", 18));
            expect(await token.balanceOf(addr2.address)).to.equal(ethers.parseUnits("50", 18));
        });
    });

    describe("Minting", () => {
        it("Should mint new tokens only by owner", async () => {
            const { token, addr1 } = await loadFixture(tokenContract);
            await token._mint(addr1.address, ethers.parseUnits("200", 18));
            const balance = await token.balanceOf(addr1.address);
            expect(balance).to.equal(ethers.parseUnits("200", 18));
        });
    });

    describe("Burning", () => {
        it("Should burn tokens only by owner", async () => {
            const { token, addr1 } = await loadFixture(tokenContract);
            await token.transfer(addr1.address, ethers.parseUnits("100", 18));
            await token._burn(addr1.address, ethers.parseUnits("50", 18));
            expect(await token.balanceOf(addr1.address)).to.equal(ethers.parseUnits("50", 18));
        });
    });
});
