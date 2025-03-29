import { ethers } from "hardhat";


  async function deployToken() {
    const token = await ethers.deployContract("Token");


    await token.waitForDeployment();

    console.log("Token Contract deployed to:", token.target);


  }


deployToken().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});