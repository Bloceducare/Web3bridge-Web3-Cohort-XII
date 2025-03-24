import { parseUnits } from "ethers";
import { ethers } from "hardhat";

async function main() {
    const [deployer, user1] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    // Deploy PeteToken
    const PeteToken = await ethers.getContractFactory("PeteToken");
    const peteToken = await PeteToken.deploy(parseUnits('10000'));
    await peteToken.waitForDeployment();
    const peteTokenAddress = await peteToken.getAddress();
    console.log("PeteToken deployed at:", peteTokenAddress);

    // Mint tokens to deployer
    const initialSupply = parseUnits("1000000"); // 1,000,000 tokens
    await peteToken.mint(deployer.address, initialSupply);
    console.log(`Minted ${initialSupply.toString()} tokens to ${deployer.address}`);

    // Deploy PeteStake
    const minimumStakeDays = 7;
    const rewardRate = 10; // 10% per year

    const PeteStake = await ethers.getContractFactory("PeteStake");
    const peteStake = await PeteStake.deploy(peteTokenAddress, minimumStakeDays, rewardRate);
    await peteStake.waitForDeployment();
    const peteStakeAddress = await peteStake.getAddress();
    console.log("PeteStake deployed at:", peteStakeAddress);

    // Fund the staking contract with rewards
    const stakeContractBalance = parseUnits("500000"); // 500,000 tokens for rewards
    await peteToken.mint(peteStakeAddress, stakeContractBalance);
    console.log(`Funded PeteStake contract with ${stakeContractBalance.toString()} tokens`);

    // Interact with the contract
    const stakeAmount = parseUnits("100");

    console.log("\n--- Interaction Begins ---");
    console.log("User1 Address:", user1.address);

    // Transfer tokens to user1
    await peteToken.transfer(user1.address, stakeAmount);
    console.log(`Transferred ${stakeAmount.toString()} tokens to User1`);

    // Approve staking
    console.log("Approving tokens for staking...");
    await peteToken.connect(user1).approve(peteStakeAddress, stakeAmount);

    // Stake tokens
    console.log("Staking tokens...");
    await peteStake.connect(user1).stake(stakeAmount);
    console.log(`User1 staked ${stakeAmount.toString()} tokens.`);

    // Check staked amount
    const stakedAmount = await peteStake.getStakedAmount(user1.address);
    console.log(`User1's Staked Amount: ${stakedAmount.toString()}`);

    // Fast forward time to simulate staking period
    console.log("Advancing time to meet staking period...");
    await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]); // 7 days
    await ethers.provider.send("evm_mine", []);

    // Withdraw stake and rewards
    console.log("Withdrawing stake and rewards...");
    await peteStake.connect(user1).withdraw();
    console.log("Withdrawal successful.");

    // Final Balance Check
    const finalBalance = await peteToken.balanceOf(user1.address);
    console.log(`User1's Final Balance: ${finalBalance.toString()}`);

    console.log("\n--- Script Execution Completed ---");
}

// Run the script
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
