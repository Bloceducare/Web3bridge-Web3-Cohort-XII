import hre from "hardhat";

async function main() {
  const tokenContract = await hre.ethers.getContractFactory("Token");
  const token = await tokenContract.deploy(hre.ethers.parseEther("1000000000"))
  await token.waitForDeployment()
  const tokenAddress = await token.getAddress()
  console.log(`Deployed token to: ${tokenAddress}`);

  // const tokenAddress = "";
  const airdropContract = await hre.ethers.getContractFactory("Airdrop");
  const airdrop = await airdropContract.deploy(token.target)
  await airdrop.waitForDeployment()

  const deployedAddress = await airdrop.getAddress()

  console.log(`Deployed contract to: ${deployedAddress}`);

  
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
})