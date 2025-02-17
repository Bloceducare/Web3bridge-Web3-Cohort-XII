import { ethers } from "hardhat";

const UNISWAP_V2_FACTORY = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f"; 

const main = async () => {
    const USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const DAIAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";

    console.log("🔍 Fetching LP Token Address...");

    // Get Uniswap V2 Factory Contract
    const factory = await ethers.getContractAt("IUniswapV2Factory", UNISWAP_V2_FACTORY);

    // Call getPair() function to get the LP Token Address
    const lpTokenAddress = await factory.getPair(USDCAddress, DAIAddress);

    console.log("✅ Uniswap LP Token Address:", lpTokenAddress);
};

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
