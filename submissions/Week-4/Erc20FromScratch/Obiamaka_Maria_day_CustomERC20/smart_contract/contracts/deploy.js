const hre = require("hardhat");

async function main() {
    const Token = await hre.ethers.getContractFactory("MyERC20Token");
    const token = await Token.deploy("MyToken", "MTK", 18, 1000000);

    await token.deployed();
    console.log(`Token deployed at: ${token.address}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
