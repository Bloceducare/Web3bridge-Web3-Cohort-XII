import { ethers } from "hardhat";


async function deploy() {
    const staking = await ethers.deployContract("Staking", [0xd9BA3F455d47789856ADaC1f116feDc8bCbD1E1C]);

    await staking.waitForDeployment();

    console.log("Staking Contract deployed to:", staking.target);


}


deploy().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});