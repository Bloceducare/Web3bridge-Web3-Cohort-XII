import { ethers } from "hardhat";

async function DeployToken() {
    const XiTK = await ethers.getContractFactory("XiTK");
    const deployXiTK = await XiTK.deploy(); 

    await deployXiTK.waitForDeployment();

    console.log("XiTK Token deployed at:", await deployXiTK.getAddress());
}

DeployToken().catch((error) => {
    console.error("Deployment failed:", error);
    process.exitCode = 1;
});
