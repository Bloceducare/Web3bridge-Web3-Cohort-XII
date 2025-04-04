import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contract with account:", deployer.address);

    const TokenAddress = "0xYourERC20TokenAddress"; // Replace with actual ERC20 token address

    const StakingContract = await ethers.getContractFactory("StakingContract");
    const stakingContract = await StakingContract.deploy(TokenAddress);

    await stakingContract.deployed();

    console.log("Staking Contract deployed at:", stakingContract.address);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
