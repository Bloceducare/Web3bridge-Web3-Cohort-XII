import { ethers } from "hardhat";

async function checkBalance() {
    const tokenAddress = "0x03d8a03b913Ad3b7BA1b311cB0F05aEAb9457805";  
    const walletAddress = "0x3f84410A6cAD617e64c5F66c6bEb90FC61D40A94";  

    const token = await ethers.getContractAt("Token", tokenAddress);
    const balance = await token.balanceOf(walletAddress);
    
    console.log("Your Token Balance:", ethers.formatUnits(balance, 18));
}

checkBalance().catch(console.error);
