const hre = require("hardhat");

async function main() {
    const stakingAddress = "YOUR_STAKING_CONTRACT_ADDRESS";
    const stakingTokenAddress = "YOUR_STAKING_ERC20_TOKEN_ADDRESS";
    const rewardTokenAddress = "YOUR_REWARD_TOKEN_ADDRESS";
    
    const [signer] = await hre.ethers.getSigners();
    const staking = await hre.ethers.getContractAt("Staking", stakingAddress);
    const stakingToken = await hre.ethers.getContractAt("IERC20", stakingTokenAddress);
    const rewardToken = await hre.ethers.getContractAt("IERC20", rewardTokenAddress);
    
    // Stake tokens
    const stakeAmount = hre.ethers.utils.parseUnits("100", 18);
    await stakingToken.approve(stakingAddress, stakeAmount);
    await staking.stake(stakeAmount);
    
    console.log("Staked successfully");
    
    // Check rewards
    const reward = await staking.calculateReward(signer.address);
    console.log("Current reward:", hre.ethers.utils.formatUnits(reward, 18));
    
    // Add rewards (for owner)
    // const rewardAmount = hre.ethers.utils.parseUnits("1000", 18);
    // await rewardToken.approve(stakingAddress, rewardAmount);
    // await staking.addRewards(rewardAmount);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });