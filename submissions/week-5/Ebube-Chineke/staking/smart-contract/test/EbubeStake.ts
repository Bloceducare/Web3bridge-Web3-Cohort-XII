
import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { parseUnits } from "ethers";

describe("EbubeStake Contract", () => {
    const deployContracts = async () => {
        const [owner, user] = await ethers.getSigners();

        // Deploy mock EbubeToken contract
        const EbubeToken = await ethers.getContractFactory("EbubeToken");
        const ebubeToken = await EbubeToken.deploy(parseUnits('10000'));
        await ebubeToken.waitForDeployment();

        // Mint tokens to owner and user
        await ebubeToken.mint(owner.address, ethers.parseUnits("1000"));
        await ebubeToken.mint(user.address, ethers.parseUnits("100"));

        // Deploy EbubeStake contract
        const EbubeStake = await ethers.getContractFactory("EbubeStake");
        const ebubeStake = await EbubeStake.deploy(ebubeToken.target, 7, 10);
        await ebubeStake.waitForDeployment();
        await ebubeToken.mint(ebubeStake.target, ethers.parseUnits("10000"));

        // Approve EbubeStake contract to transfer tokens
        await ebubeToken.approve(ebubeStake.target, ethers.parseUnits("10000"));
        await ebubeToken.connect(user).approve(ebubeStake.target, ethers.parseUnits("1000"));

        console.log("Owner", await ebubeToken.connect(user).balanceOf(ebubeStake.target));
        console.log("Stakes", await ebubeToken.connect(user).balanceOf(ebubeStake.target));


        const initialContractBalance = ethers.parseUnits("1000"); // Adjust as needed
        await ebubeToken.transfer(ebubeStake.target, initialContractBalance);

        return { ebubeStake, ebubeToken, owner, user };
    };

    describe("Staking", function () {
        it("Should allow a user to stake tokens", async function () {
            const { ebubeStake, ebubeToken, owner } = await loadFixture(deployContracts);

            await ebubeStake.stake(ethers.parseUnits("50"));
            const stake = await ebubeStake.stakes(owner.address);
            expect(stake.amount).to.equal(ethers.parseUnits("50"));
            expect(stake.active).to.be.true;
        });
    });

    describe("Rewards", function () {
        it("Should calculate rewards correctly", async function () {
            const { ebubeStake, ebubeToken, owner } = await loadFixture(deployContracts);

            await ebubeStake.stake(ethers.parseUnits("100"));
            await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]); // Increase time by 7 days
            await ethers.provider.send("evm_mine");

            const reward = await ebubeStake.calculateReward(owner.address);
            expect(reward).to.be.greaterThan(0);
        });
    });

    describe("Withdrawal", function () {
        it("Should allow users to withdraw after staking period", async function () {
            const { ebubeStake, ebubeToken, owner, user } = await loadFixture(deployContracts);
            console.log("Stakes balance before withdraw",(await ebubeToken.balanceOf(ebubeStake.target)));
            console.log("Owner's tokens before staking",(await ebubeStake.stakes(user.address)).amount);

            await ebubeStake.connect(user).stake(ethers.parseUnits("10"));
            await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]); // Increase time by 7 days
            await ethers.provider.send("evm_mine");

            console.log("Owner's tokens after staking",(await ebubeStake.stakes(owner.address)).amount);
            console.log("Stakes balance after withdraw",(await ebubeToken.balanceOf(ebubeStake.target)));

            //   await ebubeToken.approve(ebubeStake.target, ethers.parseUnits("10000"));
            console.log("allowance", await ebubeToken.allowance(ebubeStake.target, owner.address));
            await ebubeStake.connect(user).withdraw();
            const stake = await ebubeStake.stakes(user.address);
            expect(stake.amount).to.equal(0);
            expect(stake.active).to.be.false;
        });
    });
});
