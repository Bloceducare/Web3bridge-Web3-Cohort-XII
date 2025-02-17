import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`🚀 Deploying BoardFundManagerFactory with account: ${deployer.address}`);

  // Deploy the factory contract
  const BoardFundManagerFactory = await ethers.getContractFactory("BoardFundManagerFactory");
  const factory = await BoardFundManagerFactory.deploy();
  await factory.waitForDeployment();

  console.log(`✅ BoardFundManagerFactory deployed at: ${await factory.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


// npx hardhat run scripts/deployFactory.ts --network base_sepolia
// npx hardhat run scripts/deployFund.ts --network base_sepolia
// npx hardhat run scripts/depositFunds.ts --network base_sepolia
//npx hardhat run scripts/checkBalance.ts --network base_sepolia

// npx hardhat run scripts/submitTransaction.ts --network base_sepolia
//npx hardhat run scripts/getTransactions.ts --network base_sepolia

// npx hardhat run scripts/approveTransaction.ts --network base_sepolia
// npx hardhat run scripts/executeTransaction.ts --network base_sepolia
