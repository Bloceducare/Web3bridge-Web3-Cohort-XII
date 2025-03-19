import { ethers } from "hardhat";
import { Airdrop, AirdropToken } from "../typechain-types";

async function main() {
    // Get signers
    const [owner, user1, user2, nonWhitelisted] = await ethers.getSigners();
    
    // Replace with your deployed contract addresses
    const TOKEN_ADDRESS = "0x102c99BA8b28EA5b83538D39DebE9816d83087a9";
    const AIRDROP_ADDRESS = "0x84F51033262D7837f2D562a20966cC33Ec3368de";

    // Attach to contracts
    const token = await ethers.getContractAt("AirdropToken", TOKEN_ADDRESS) as AirdropToken;
    const airdrop = await ethers.getContractAt("Airdrop", AIRDROP_ADDRESS) as Airdrop;

    console.log("Starting automated interaction with Airdrop contract...\n");

    // Step 1: Check initial balances
    console.log("Step 1: Checking initial balances");
    const ownerBalance = await token.balanceOf(owner.address);
    console.log(`Owner balance: ${ethers.formatEther(ownerBalance)} HAT`);
    console.log(`Airdrop contract balance: ${ethers.formatEther(await token.balanceOf(AIRDROP_ADDRESS))} HAT\n`);

    // Step 2: Add users to whitelist
    console.log("Step 2: Adding users to whitelist");
    const whitelistTx = await airdrop.addToWhitelist([user1.address, user2.address]);
    await whitelistTx.wait();
    console.log(`Users ${user1.address} and ${user2.address} added to whitelist\n`);

    // Step 3: Complete tasks for non-whitelisted user
    console.log("Step 3: Completing tasks for non-whitelisted user");
    for (let i = 1; i <= 3; i++) {
        const taskTx = await airdrop.connect(nonWhitelisted).completeTask(i);
        await taskTx.wait();
        console.log(`Task ${i} completed for ${nonWhitelisted.address}`);
    }
    console.log(`Task completions for ${nonWhitelisted.address}: ${await airdrop.taskCompletions(nonWhitelisted.address)}\n`);

    // Step 4: Claim airdrop for whitelisted user
    console.log("Step 4: Claiming airdrop for whitelisted user");
    const claimTx1 = await airdrop.connect(user1).claimAirdrop();
    await claimTx1.wait();
    console.log(`Airdrop claimed for ${user1.address}`);
    console.log(`New balance for ${user1.address}: ${ethers.formatEther(await token.balanceOf(user1.address))} HAT\n`);

    // Step 5: Claim airdrop for user with completed tasks
    console.log("Step 5: Claiming airdrop for user with completed tasks");
    const claimTx2 = await airdrop.connect(nonWhitelisted).claimAirdrop();
    await claimTx2.wait();
    console.log(`Airdrop claimed for ${nonWhitelisted.address}`);
    console.log(`New balance for ${nonWhitelisted.address}: ${ethers.formatEther(await token.balanceOf(nonWhitelisted.address))} HAT\n`);

    // Step 6: Check balances using checkBalance function
    console.log("Step 6: Checking balances using checkBalance");
    const user1Balance = await airdrop.checkBalance(user1.address);
    const nonWhitelistedBalance = await airdrop.checkBalance(nonWhitelisted.address);
    console.log(`User1 balance (via checkBalance): ${ethers.formatEther(user1Balance)} HAT`);
    console.log(`Non-whitelisted user balance (via checkBalance): ${ethers.formatEther(nonWhitelistedBalance)} HAT\n`);

    // Step 7: Set new reward amount
    console.log("Step 7: Setting new reward amount");
    const newReward = ethers.parseEther("200");
    const rewardTx = await airdrop.setRewardAmount(newReward);
    await rewardTx.wait();
    console.log(`New reward amount set to: ${ethers.formatEther(await airdrop.rewardAmount())} HAT\n`);

    // Step 8: Withdraw tokens (by owner)
    console.log("Step 8: Withdrawing tokens");
    const withdrawAmount = ethers.parseEther("1000");
    const withdrawTx = await airdrop.withdrawTokens(withdrawAmount);
    await withdrawTx.wait();
    console.log(`Withdrawn ${ethers.formatEther(withdrawAmount)} HAT to owner`);
    console.log(`New owner balance: ${ethers.formatEther(await token.balanceOf(owner.address))} HAT\n`);

    // Step 9: Try some invalid operations
    console.log("Step 9: Testing invalid operations");
    try {
        await airdrop.connect(user1).withdrawTokens(ethers.parseEther("100"));
    } catch (error) {
        console.log("Successfully blocked unauthorized withdrawal attempt");
    }

    try {
        await airdrop.connect(user1).claimAirdrop();
    } catch (error) {
        console.log("Successfully blocked double claim attempt");
    }

    console.log("\nAutomated interaction completed successfully!");
}

main().catch((error) => {
    console.error("Error during interaction:", error);
    process.exitCode = 1;
});