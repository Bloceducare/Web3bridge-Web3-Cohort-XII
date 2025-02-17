import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const RampopToken = await ethers.getContractFactory("RampopToken");
  const initialSupply = ethers.parseUnits("1000000000", 18);
  const token = await RampopToken.deploy(initialSupply);

  await token.waitForDeployment();
  console.log("RampopToken deployed to:", await token.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
