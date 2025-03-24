import { ethers } from "hardhat";

async function main() {
    const [deployer, user1] = await ethers.getSigners();

    const peteTokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const peteStakeAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

    const PeteToken = await ethers.getContractFactory("PeteToken");
    const peteToken = PeteToken.attach(peteTokenAddress);

    const PeteStake = await ethers.getContractFactory("PeteStake");
    const peteStake = PeteStake.attach(peteStakeAddress);

    const stakeAmount = ethers.parseUnits("100");

    console.log("User1 Address:", user1.address);

    // Approve and Stake
    console.log("Approving tokens for staking...");
    await peteToken.connect(user1).approve(peteStakeAddress, stakeAmount);
    console.log("Staking tokens...");
    await peteStake.connect(user1).stake(stakeAmount);
    console.log(`User1 staked ${stakeAmount.toString()} tokens.`);

    // Check Staked Amount
    const stakedAmount = await peteStake.getStakedAmount(user1.address);
    console.log(`User1's Staked Amount: ${stakedAmount.toString()}`);

    // Fast forward time for testing (use Hardhat's evm_increaseTime in local testing)
    console.log("Advancing time to meet staking period...");
    await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]); // 7 days
    await ethers.provider.send("evm_mine", []);

    // Withdraw
    console.log("Withdrawing stake and rewards...");
    await peteStake.connect(user1).withdraw();
    console.log("Withdrawal successful.");

    // Final Balance Check
    const finalBalance = await peteToken.balanceOf(user1.address);
    console.log(`User1's Final Balance: ${finalBalance.toString()}`);
}

// Run interaction script
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
