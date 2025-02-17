
import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("SwapContract", function() {
    let swapContract: Contract;
    let tokenX: Contract, tokenY: Contract;
    let owner: Signer, addr1: Signer, addr2: Signer;

    async function deployFixture() {
        // Deploy mock ERC20 tokens for X and Y
        const Token = await ethers.getContractFactory("myTestToken");
        tokenX = await Token.deploy("TokenX", "TX");
        tokenY = await Token.deploy("TokenY", "TY");

        // Deploy SwapContract
        const Swap = await ethers.getContractFactory("SwapContract");
        swapContract = await Swap.deploy(tokenX.address, tokenY.address);
        
        [owner, addr1, addr2] = await ethers.getSigners();

        // Add some liquidity to start with
        await tokenX.connect(owner).approve(swapContract.address, ethers.utils.parseEther("1000"));
        await tokenY.connect(owner).approve(swapContract.address, ethers.utils.parseEther("1000"));
        await swapContract.connect(owner).addLiquidity(ethers.utils.parseEther("1000"), ethers.utils.parseEther("1000"));

        return { swapContract, tokenX, tokenY, owner, addr1, addr2 };
    }

    it("Should swap correctly", async function() {
        const { swapContract, tokenX, tokenY, addr1 } = await loadFixture(deployFixture);

        const amountXIn = ethers.utils.parseEther("1");
        const expectedYOut = await swapContract.getAmountYForX(amountXIn);
        
        await tokenX.connect(addr1).approve(swapContract.address, amountXIn);
        await swapContract.connect(addr1).swap(amountXIn);
        
        const addr1BalanceY = await tokenY.balanceOf(await addr1.getAddress());
        expect(addr1BalanceY).to.be.closeTo(expectedYOut, 1);
    });
});