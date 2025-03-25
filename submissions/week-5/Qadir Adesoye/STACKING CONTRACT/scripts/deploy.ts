const hre = require("hardhat");

async function main() {
    // Deploy reward token
    const MyRewardToken = await hre.ethers.getContractFactory("MyRewardToken");
    const rewardToken = await MyRewardToken.deploy(
        "My Reward Token",
        "MRT",
        hre.ethers.utils.parseUnits("1000000", 18)
    );
    await rewardToken.deployed();
    
    // Replace with the staking token address
    const stakingTokenAddress = "YOUR_STAKING_ERC20_TOKEN_ADDRESS";
    
    const Staking = await hre.ethers.getContractFactory("Staking");
    const staking = await Staking.deploy(stakingTokenAddress, rewardToken.address);
    await staking.deployed();
    
    console.log("Reward Token deployed to:", rewardToken.address);
    console.log("Staking contract deployed to:", staking.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });