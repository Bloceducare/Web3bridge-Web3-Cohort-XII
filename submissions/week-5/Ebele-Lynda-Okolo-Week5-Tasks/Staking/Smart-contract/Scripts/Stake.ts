import { ethers } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

// Load contract details
const stakingContractAddress = "0xYourDeployedContractAddress"; // Replace with actual address
const stakingTokenAddress = "0xYourERC20TokenAddress"; // Replace with actual token address

// ABI (Application Binary Interface)
const stakingABI = [
    "function stake(uint256 _amount) external",
    "function withdraw() external",
    "function calculateReward(address _user) external view returns (uint256)"
];

const tokenABI = [
    "function approve(address spender, uint256 amount) public returns (bool)",
];

async function main() {
    const provider = new ethers.providers.JsonRpcProvider(process.env.ALCHEMY_RPC_URL);
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    const stakingContract = new ethers.Contract(stakingContractAddress, stakingABI, signer);
    const tokenContract = new ethers.Contract(stakingTokenAddress, tokenABI, signer);

    const stakingAmount = ethers.utils.parseEther("1.0"); // 1 Token

    // Approve the staking contract to spend tokens
    const approveTx = await tokenContract.approve(stakingContractAddress, stakingAmount);
    await approveTx.wait();
    console.log("Approved tokens for staking.");

    // Stake tokens
    const stakeTx = await stakingContract.stake(stakingAmount);
    await stakeTx.wait();
    console.log("Staked successfully.");

    // Check reward
    const reward = await stakingContract.calculateReward(signer.address);
    console.log("Current reward:", ethers.utils.formatEther(reward));

    // Withdraw after the staking period
    setTimeout(async () => {
        const withdrawTx = await stakingContract.withdraw();
        await withdrawTx.wait();
        console.log("Withdrawal successful!");
    }, 7000); // Simulating wait time (should be after 7 days)
}

main().catch(console.error);
