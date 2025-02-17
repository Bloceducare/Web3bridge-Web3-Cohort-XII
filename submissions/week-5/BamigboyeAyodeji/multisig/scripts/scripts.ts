const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}`);

  // Déploiement du token ERC20 (si nécessaire)
  const Token = await hre.ethers.getContractFactory("IntERC20");
  const token = await Token.deploy("MyToken", "MTK", 1000000000);
  await token.waitForDeployment();

  console.log(`Token deployed at: ${token.target}`);

  // Déploiement du contrat FundsManagement
  const FundsManagement = await hre.ethers.getContractFactory("FundsManagement");
  const fundManager = await FundsManagement.deploy(token.target);
  await fundManager.waitForDeployment();

  console.log(`FundsManagement deployed at: ${fundManager.target}`);
  
}

// Exécuter le script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
