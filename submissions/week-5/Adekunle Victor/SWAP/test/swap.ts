const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Swap Contract", function () {
    let tokenX, tokenY, swapContract;
    let owner, user1, user2;

    beforeEach(async function () {
        // Get signers
        [owner, user1, user2] = await ethers.getSigners();

        // Deploy TokenX and TokenY
        const TokenX = await ethers.getContractFactory("TokenX");
        tokenX = await TokenX.deploy();
        await tokenX.waitForDeployment(); // Use waitForDeployment instead of deployed()

        const TokenY = await ethers.getContractFactory("TokenY");
        tokenY = await TokenY.deploy();
        await tokenY.waitForDeployment(); // Use waitForDeployment instead of deployed()

        // Deploy Swap Contract
        const Swap = await ethers.getContractFactory("Swap");
        swapContract = await Swap.deploy(tokenX.target, tokenY.target); // Use .target for contract addresses
        await swapContract.waitForDeployment(); // Use waitForDeployment instead of deployed()

        // Mint tokens to users
        await tokenX.transfer(user1.address, ethers.parseEther("1000"));
        await tokenY.transfer(user1.address, ethers.parseEther("1000"));
        await tokenX.transfer(user2.address, ethers.parseEther("1000"));
        await tokenY.transfer(user2.address, ethers.parseEther("1000"));

        // Approve tokens for use in the swap contract
        await tokenX.connect(user1).approve(swapContract.target, ethers.parseEther("1000"));
        await tokenY.connect(user1).approve(swapContract.target, ethers.parseEther("1000"));
        await tokenX.connect(user2).approve(swapContract.target, ethers.parseEther("1000"));
        await tokenY.connect(user2).approve(swapContract.target, ethers.parseEther("1000"));
    });

    describe("Add Liquidity", function () {
        it("Should add liquidity successfully", async function () {
            const amountX = ethers.parseEther("100");
            const amountY = ethers.parseEther("100");

            await swapContract.connect(user1).addLiquidity(amountX, amountY);

            expect(await swapContract.reserveX()).to.equal(amountX);
            expect(await swapContract.reserveY()).to.equal(amountY);
            expect(await tokenX.balanceOf(swapContract.target)).to.equal(amountX);
            expect(await tokenY.balanceOf(swapContract.target)).to.equal(amountY);
        });

        it("Should revert if no liquidity is added", async function () {
            await expect(
                swapContract.connect(user1).addLiquidity(0, ethers.parseEther("100"))
            ).to.be.revertedWithCustomError(swapContract, "InvalidAmount");
        
            await expect(
                swapContract.connect(user1).addLiquidity(ethers.parseEther("100"), 0)
            ).to.be.revertedWithCustomError(swapContract, "InvalidAmount");
        });
    });

    describe("Swap Tokens", function () {
        beforeEach(async function () {
            // Add initial liquidity
            const amountX = ethers.parseEther("100");
            const amountY = ethers.parseEther("100");
            await swapContract.connect(user1).addLiquidity(amountX, amountY);
        });

        it("Should swap TokenX for TokenY", async function () {
            const amountIn = ethers.parseEther("10");
            const reserveX = await swapContract.reserveX();
            const reserveY = await swapContract.reserveY();
        
            const amountInWithFee = (amountIn * 997n) / 1000n; // Use BigInt literals
            const numerator = reserveY * amountInWithFee;
            const denominator = reserveX + amountInWithFee;
            const expectedAmountOut = ethers.BigNumber.from(numerator / denominator); // Convert to BigNumber
        
            await swapContract.connect(user2).swap(tokenX.target, amountIn);
        
            expect(await tokenX.balanceOf(user2.address)).to.equal(
                ethers.parseEther("1000") - amountIn
            );
            expect(await tokenY.balanceOf(user2.address)).to.equal(
                ethers.parseEther("1000").add(expectedAmountOut)
            );
        
            expect(await swapContract.reserveX()).to.equal(reserveX.add(amountIn));
            expect(await swapContract.reserveY()).to.equal(reserveY.sub(expectedAmountOut));
        });
        
        it("Should swap TokenY for TokenX", async function () {
            const amountIn = ethers.parseEther("10");
            const reserveX = await swapContract.reserveX();
            const reserveY = await swapContract.reserveY();
        
            const amountInWithFee = (amountIn * 997n) / 1000n; // Use BigInt literals
            const numerator = reserveX * amountInWithFee;
            const denominator = reserveY + amountInWithFee;
            const expectedAmountOut = ethers.BigNumber.from(numerator / denominator); // Convert to BigNumber
        
            await swapContract.connect(user2).swap(tokenY.target, amountIn);
        
            expect(await tokenY.balanceOf(user2.address)).to.equal(
                ethers.parseEther("1000") - amountIn
            );
            expect(await tokenX.balanceOf(user2.address)).to.equal(
                ethers.parseEther("1000").add(expectedAmountOut)
            );
        
            expect(await swapContract.reserveY()).to.equal(reserveY.add(amountIn));
            expect(await swapContract.reserveX()).to.equal(reserveX.sub(expectedAmountOut));
        });

        it("Should revert if swap amount is zero", async function () {
            await expect(
                swapContract.connect(user2).swap(tokenX.target, 0)
            ).to.be.revertedWithCustomError(swapContract, "InvalidAmount");

            await expect(
                swapContract.connect(user2).swap(tokenY.target, 0)
            ).to.be.revertedWithCustomError(swapContract, "InvalidAmount");
        });

        it("Should revert if there is insufficient liquidity", async function () {
            await expect(
                swapContract.connect(user2).swap(tokenX.target, ethers.parseEther("200"))
            ).to.be.revertedWithCustomError(swapContract, "InsufficientLiquidity");
        
            await expect(
                swapContract.connect(user2).swap(tokenY.target, ethers.parseEther("200"))
            ).to.be.revertedWithCustomError(swapContract, "InsufficientLiquidity");
        });
        it("Should revert if the swap fails due to low output", async function () {
            const amountIn = ethers.parseEther("1");
            await expect(
                swapContract.connect(user2).swap(tokenX.target, amountIn)
            ).to.not.be.reverted; // Ensure small swaps work
        
            // Attempting a very large input might result in zero output
            const largeInput = ethers.parseEther("1000000000");
            await expect(
                swapContract.connect(user2).swap(tokenX.target, largeInput)
            ).to.be.revertedWithCustomError(swapContract, "SwapFailed");
        });
    });
});