import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
  
    const ProductManager = await ethers.getContractFactory("ProductManager");
    const productManager = await ProductManager.deploy();
    await productManager.waitForDeployment();
  
    console.log("ProductManager deployed to:", await productManager.getAddress());
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
  