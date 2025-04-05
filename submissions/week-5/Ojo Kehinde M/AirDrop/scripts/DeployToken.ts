import { ethers } from "hardhat";

async function DeployToken() {
    const Token = await ethers.getContractFactory("Token");
    const deployToken = await Token.deploy(); 

    await deployToken.waitForDeployment();

    console.log("Token deployed at:", await deployToken.getAddress());
}

DeployToken().catch((error) => {
    console.error("Deployment failed:", error);
    process.exitCode = 1;
});
