import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const ScholarshipManager = await ethers.getContractFactory("ScholarshipManager");
  const scholarshipManager = await ScholarshipManager.deploy();
  await scholarshipManager.waitForDeployment();

  console.log("ScholarshipManager contract deployed to:", await scholarshipManager.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
