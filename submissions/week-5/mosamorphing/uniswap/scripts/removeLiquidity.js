const { ethers } = require("hardhat");
const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");

async function main() {
    console.log("Running removeLiquidity script...");
    const USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const DAIAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    const theAddressIFoundWithUSDCAndDAI = "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";

    // Impersonate the account
    await helpers.impersonateAccount(theAddressIFoundWithUSDCAndDAI);
    const impersonatedSigner = await ethers.getSigner(theAddressIFoundWithUSDCAndDAI);

    // **Set balance so the account has ETH for gas fees**
    await ethers.provider.send("hardhat_setBalance", [
        theAddressIFoundWithUSDCAndDAI,
        ethers.toBeHex(ethers.parseEther("10")) // Give it 10 ETH
    ]);

    console.log("✅ Impersonated account funded with ETH");

    let uniswapContract = await ethers.getContractAt('IUniswapV2Router02', UNIRouter);

    let liquidity = ethers.parseUnits("10000", 18); // Adjust based on available liquidity
    let amountAMin = ethers.parseUnits("9900", 6);
    let amountBMin = ethers.parseUnits("9900", 18);
    let deadline = await helpers.time.latest() + 500;

    console.log('------------------ Removing liquidity ------------------');
    await uniswapContract.connect(impersonatedSigner).removeLiquidity(
        USDCAddress,
        DAIAddress,
        liquidity,
        amountAMin,
        amountBMin,
        impersonatedSigner.address,
        deadline
    );

    console.log('------------------ Liquidity removed ------------------');
};

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
