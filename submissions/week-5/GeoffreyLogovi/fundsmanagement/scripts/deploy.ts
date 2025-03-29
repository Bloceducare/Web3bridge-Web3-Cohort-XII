const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}`);

  const Token = await hre.ethers.getContractFactory("IntERC20");
  const token = await Token.deploy("MyToken", "JAY", 4500000000);
  await token.waitForDeployment();

  console.log(`Token deployed at: ${token.target}`);

  const FundsManagement = await hre.ethers.getContractFactory("CFManagement");
  const fundManager = await FundsManagement.deploy(token.target);
  await fundManager.waitForDeployment();

  console.log(`FundsManagement deployed at: ${fundManager.target}`);
  
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
