const { ethers } = require("hardhat");

async function main() {
    // Get signers
    const [owner, user1] = await ethers.getSigners();

    console.log(`Deploying contracts using address: ${owner.address}`);

    // Deploy DripToken
    const DripToken = await ethers.getContractFactory("DripToken");
    const dripToken = await DripToken.deploy(owner.address);
    await dripToken.waitForDeployment();
    console.log(`DripToken deployed at: ${dripToken.target}`);

    // Mint tokens to user1
    const initialSupply = ethers.parseEther("1000"); // 1000 DRP
    await dripToken.mint(user1.address, initialSupply);
    console.log(`Minted 1000 DRP to user1`);

    // Deploy Staking Contract
    const Staking = await ethers.getContractFactory("Staking");
    const stakingContract = await Staking.deploy(dripToken.target);
    await stakingContract.waitForDeployment();
    console.log(`Staking Contract deployed at: ${stakingContract.target}`);

    // Approve tokens for staking
    await dripToken.connect(user1).approve(stakingContract.target, initialSupply);

    // Stake tokens
    const stakeAmount = ethers.parseEther("100"); // Stake 100 DRP
    console.log(`User1 staking ${ethers.formatEther(stakeAmount)} DRP...`);
    await stakingContract.connect(user1).stake(stakeAmount);
    console.log(`Staked successfully!`);
    console.log(`User1's staked amount: ${ethers.formatEther(await stakingContract.stakedAmount(user1.address))}`);
    console.log(`Total supply in staking contract: ${ethers.formatEther(await stakingContract.totalSupply())}`);

    // Wait for 10 seconds to accumulate rewards
    console.log("Waiting for 10 seconds to accumulate rewards...");
    await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait for 10 seconds

    // Claim rewards
    console.log("Claiming rewards...");
    const initialBalance = await dripToken.balanceOf(user1.address);
    await stakingContract.connect(user1).claimRewards();
    const finalBalance = await dripToken.balanceOf(user1.address);

    // Debug logs
    console.log("Initial balance:", initialBalance.toString());
    console.log("Final balance:", finalBalance.toString());

    // Ensure both balances are defined
    if (!initialBalance || !finalBalance) {
        throw new Error("Initial or final balance is undefined");
    }

    // Convert balances to ethers.BigNumber
    const initialBalanceBN = ethers.BigNumber.from(initialBalance.toString());
    const finalBalanceBN = ethers.BigNumber.from(finalBalance.toString());

    // Calculate reward
    const reward = finalBalanceBN.sub(initialBalanceBN);
    console.log(`Claimed rewards: ${ethers.formatEther(reward)} DRP`);
    console.log(`User1's new balance: ${ethers.formatEther(finalBalanceBN)}`);

    // Unstake tokens
    const unstakeAmount = ethers.parseEther("50"); // Unstake 50 DRP
    console.log(`User1 unstaking ${ethers.formatEther(unstakeAmount)} DRP...`);
    await stakingContract.connect(user1).unstake(unstakeAmount);
    console.log(`Unstaked successfully!`);
    console.log(`User1's remaining staked amount: ${ethers.formatEther(await stakingContract.stakedAmount(user1.address))}`);
    console.log(`Total supply in staking contract: ${ethers.formatEther(await stakingContract.totalSupply())}`);

    // Check balances after unstaking
    console.log("Checking balances after unstaking...");
    console.log(`User1's DRP balance: ${ethers.formatEther(await dripToken.balanceOf(user1.address))}`);
    console.log(`Staking contract's DRP balance: ${ethers.formatEther(await dripToken.balanceOf(stakingContract.target))}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});