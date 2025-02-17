import { ethers } from "hardhat"; // Correct import for Hardhat

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const CompanyFunds = await ethers.getContractFactory("CompanyFunds");
    const boardAddresses = []; // Add board member addresses here
    const tokenAddress = "0x..."; // Replace with actual token address
    const companyFunds = await CompanyFunds.deploy(boardAddresses, tokenAddress);

    await companyFunds.deployed();
    console.log("CompanyFunds deployed to:", companyFunds.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });