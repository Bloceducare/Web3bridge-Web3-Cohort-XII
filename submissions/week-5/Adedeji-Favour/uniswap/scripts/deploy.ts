import hre from "hardhat";

async function main() {
  // tokenX;
  const tokenContractX = await hre.ethers.getContractFactory("TokenX");
  const tokenX = await tokenContractX.deploy(hre.ethers.parseEther("1000000000"))
  await tokenX.waitForDeployment()
  const tokenAddressX = await tokenX.getAddress()
  console.log(`Deployed token to: ${tokenAddressX}`);

  // tokenY;
  const tokenContractY = await hre.ethers.getContractFactory("TokenX");
  const tokenY = await tokenContractY.deploy(hre.ethers.parseEther("1000000000"))
  await tokenY.waitForDeployment()
  const tokenAddressY = await tokenY.getAddress()
  console.log(`Deployed token to: ${tokenAddressY}`);

  // contract;
  const airdropContract = await hre.ethers.getContractFactory("Uniswap");
  const airdrop = await airdropContract.deploy(tokenX.target, tokenY.target)
  await airdrop.waitForDeployment()

  const deployedAddress = await airdrop.getAddress()

  console.log(`Deployed contract to: ${deployedAddress}`); 
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
})