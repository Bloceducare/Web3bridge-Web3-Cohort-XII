const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    try {
        console.log("Starting deployment and interaction script...");

        const [deployer, user1] = await ethers.getSigners();
        console.log("Deploying contracts with account:", deployer.address);

        console.log("\nDeploying LagCoin...");
        const LagCoin = await ethers.getContractFactory("LagCoin");
        const lagCoin = await LagCoin.deploy(deployer.address);
        await lagCoin.waitForDeployment();
        console.log("LagCoin deployed to:", await lagCoin.getAddress());

        console.log("\nDeploying Staking Contract...");
        const Staking = await ethers.getContractFactory("Staking");
        const staking = await Staking.deploy(await lagCoin.getAddress());
        await staking.waitForDeployment();
        console.log("Staking Contract deployed to:", await staking.getAddress());

        console.log("\nMinting tokens to user1...");
        const mintAmount = ethers.parseEther("1000");
        await lagCoin.mint(user1.address, mintAmount);
        console.log(`Minted ${ethers.formatEther(mintAmount)} tokens to ${user1.address}`);

        console.log("\nStarting contract interactions...");

        const stakeAmount = ethers.parseEther("100");
        const lockTime = 7 * 24 * 60 * 60; // 7 days in seconds

        console.log("\nApproving tokens for staking...");
        await lagCoin.connect(user1).approve(await staking.getAddress(), stakeAmount);
        console.log("Tokens approved");

        console.log("\nStaking tokens...");
        await staking.connect(user1).stake(stakeAmount, lockTime);
        console.log(`Staked ${ethers.formatEther(stakeAmount)} tokens for ${lockTime / (24 * 60 * 60)} days`);

        console.log("\nFast forwarding time...");
        await hre.network.provider.send("evm_increaseTime", [lockTime + 1]);
        await hre.network.provider.send("evm_mine");

        let balanceBefore = await lagCoin.balanceOf(user1.address);
        console.log("\nBalance before withdrawal:", ethers.formatEther(balanceBefore));

        console.log("\nWithdrawing staked tokens...");
        try {
            await staking.connect(user1).withdraw();
        } catch (error) {
            console.error("Withdrawal failed. Trying a reduced amount...");
            const reducedAmount = ethers.parseEther("80"); // Reduce withdrawal amount
            await staking.connect(user1).partialWithdraw(reducedAmount);
        }

        let balanceAfter = await lagCoin.balanceOf(user1.address);
        console.log("Balance after withdrawal:", ethers.formatEther(balanceAfter));
        console.log("Rewards earned:", ethers.formatEther(balanceAfter - balanceBefore - stakeAmount));

        const addresses = {
            lagCoin: await lagCoin.getAddress(),
            staking: await staking.getAddress()
        };

        const fs = require("fs");
        fs.writeFileSync(
            "deployed-addresses.json",
            JSON.stringify(addresses, null, 2)
        );
        console.log("\nContract addresses saved to deployed-addresses.json");

    } catch (error) {
        console.error("Error in deployment script:", error);
        process.exitCode = 1;
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });