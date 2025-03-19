import hre, { ethers } from "hardhat";
import { SalesAgreement } from "../typechain-types";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  // Deploy the contract
  const SalesAgreement = await ethers.getContractFactory("salesAgreement");
  const salesAgreement = await SalesAgreement.deploy();
  await salesAgreement.waitForDeployment();

  const address = await salesAgreement.getAddress();
  console.log("SalesAgreement deployed to:", address);

  // Verify contract
  if (process.env.ETHERSCAN_API) {
    console.log("Waiting for block confirmations...");
    const deployTx = salesAgreement.deploymentTransaction();
    if (deployTx) {
      await deployTx.wait();
      await verifyContract(address);
      console.log();
    }
  }
}

async function verifyContract(address: string) {
  try {
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: [],
    });
  } catch (error) {
    console.error("Error verifying contract:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
