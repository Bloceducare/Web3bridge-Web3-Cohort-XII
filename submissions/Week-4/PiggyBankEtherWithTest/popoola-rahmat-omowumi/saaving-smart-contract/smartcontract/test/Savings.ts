import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { SavingsLock } from "../typechain-types";

describe("SavingsLock Contract", function () {
    async function deploySavingsLock() {
        const [owner, addr1] = await ethers.getSigners();
        const initialLockPeriod = 60; // 60 seconds

        const SavingsLock = await ethers.getContractFactory("SavingsLock");
        const savingsLock = await SavingsLock.deploy(initialLockPeriod, { value: ethers.utils.parseEther("1") });

        return { savingsLock, owner, addr1, initialLockPeriod };
    }

    it("Should deploy and set the correct owner", async function () {
        const { savingsLock, owner } = await loadFixture(deploySavingsLock);
        expect(await savingsLock.owner()).to.equal(owner.address);
    });

    it("Should have correct initial unlock time", async function () {
        const { savingsLock, initialLockPeriod } = await loadFixture(deploySavingsLock);
        const blockTime = await time.latest();
        expect(await savingsLock.unlockTime()).to.be.closeTo(blockTime + initialLockPeriod, 2);
    });

    it("Should accept deposits and update contract balance", async function () {
        const { savingsLock, owner } = await loadFixture(deploySavingsLock);
        const depositAmount = ethers.utils.parseEther("0.5");

        await expect(owner.sendTransaction({ to: savingsLock.address, value: depositAmount }))
            .to.changeEtherBalance(savingsLock, depositAmount);

        expect(await ethers.provider.getBalance(savingsLock.address)).to.equal(ethers.utils.parseEther("1.5"));
    });

    it("Should prevent withdrawals before unlock time", async function () {
        const { savingsLock } = await loadFixture(deploySavingsLock);
        await expect(savingsLock.withdraw(ethers.utils.parseEther("0.5"))).to.be.revertedWith("Funds are still locked");
    });

    it("Should allow owner to withdraw after unlock time", async function () {
        const { savingsLock, owner, initialLockPeriod } = await loadFixture(deploySavingsLock);
        const withdrawAmount = ethers.utils.parseEther("0.5");

        await time.increase(initialLockPeriod + 1); // Increase time past unlock period

        await expect(() => savingsLock.withdraw(withdrawAmount)).to.changeEtherBalance(owner, withdrawAmount);
        expect(await ethers.provider.getBalance(savingsLock.address)).to.equal(ethers.utils.parseEther("0.5"));
    });

    it("Should allow lock extension", async function () {
        const { savingsLock, initialLockPeriod } = await loadFixture(deploySavingsLock);
        const extraTime = 30; // Extending by 30 seconds

        await savingsLock.extendLock(extraTime);
        expect(await savingsLock.unlockTime()).to.be.greaterThan(await time.latest());
    });

    it("Should allow emergency withdrawal with a 10% fee", async function () {
        const { savingsLock, owner } = await loadFixture(deploySavingsLock);
        const contractBalance = await ethers.provider.getBalance(savingsLock.address);

        const fee = contractBalance.mul(10).div(100); // Fix for BigNumber operation
        const expectedWithdrawAmount = contractBalance.sub(fee); // Fix for subtraction

        await expect(() => savingsLock.emergencyWithdraw()).to.changeEtherBalance(owner, expectedWithdrawAmount);
        expect(await ethers.provider.getBalance(savingsLock.address)).to.equal(0);
    });

    it("Should emit events correctly", async function () {
        const { savingsLock, owner } = await loadFixture(deploySavingsLock);
        const depositAmount = ethers.utils.parseEther("0.5");

        await expect(owner.sendTransaction({ to: savingsLock.address, value: depositAmount }))
            .to.emit(savingsLock, "Deposited")
            .withArgs(owner.address, depositAmount);
    });
});
