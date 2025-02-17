import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with deployer:", deployer.address);

    //convert initial supply using ethers.parseUnits()
    const initialSupply = ethers.parseUnits("1000000", 18); 

    //deploy ERC-20 Mock Token (CXII)
    const ERC20 = await ethers.getContractFactory("ERC20Mock");
    const erc20 = await ERC20.deploy("CXIIToken", "CXII", initialSupply);
    await erc20.waitForDeployment();
    console.log("ERC20Mock deployed to:", await erc20.getAddress());

    //deploy ERC-721 Mock NFT (AjoNFT)
    const ERC721 = await ethers.getContractFactory("ERC721Mock");
    const erc721 = await ERC721.deploy("AjoNFT", "AJNFT", deployer.address);
    await erc721.waitForDeployment();
    console.log("ERC721Mock deployed to:", await erc721.getAddress());

    //deploy AJO Contract
    const targetAmount = ethers.parseUnits("5000", 18);
    const withdrawalDate = Math.floor(Date.now() / 1000) + 604800; 
    const AJO = await ethers.getContractFactory("AJO");
    const ajo = await AJO.deploy(
        targetAmount,
        withdrawalDate,
        deployer.address,
        await erc20.getAddress(),
        await erc721.getAddress()
    );
    await ajo.waitForDeployment();
    console.log("AJO deployed to:", await ajo.getAddress());

    console.log("\n Deployment Successful!");
    console.log("ERC20 Address:", await erc20.getAddress());
    console.log("ERC721 Address:", await erc721.getAddress());
    console.log("AJO Address:", await ajo.getAddress());
}

main().catch((error) => {
    console.error("Deployment failed:", error);
    process.exitCode = 1;
});
