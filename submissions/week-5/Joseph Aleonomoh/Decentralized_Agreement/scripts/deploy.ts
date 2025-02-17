import { ethers } from "hardhat";


  async function deploy() {
    const token = await ethers.deployContract("Token", ["Leo Token", "LTK"]);

    await token.waitForDeployment();

    console.log("TokenContract deployed to:", token.target);


    const agreement = await ethers.deployContract("AgreementFactory", [token.target]);

    await agreement.waitForDeployment();

    console.log("EventContract deployed to:", agreement.target);


  }


deploy().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});