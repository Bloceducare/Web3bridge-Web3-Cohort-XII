import { ethers } from "hardhat";

async function main() {
  console.log("Deploying EventFactory...");

  const EventFactory = await ethers.getContractFactory("EventFactory");
  const factory = await EventFactory.deploy();

  await factory.waitForDeployment(); 
  
  console.log(`EventFactory deployed to: ${await factory.getAddress()}`); 
  //I want to console log every detail when an event factory is deployed
  console.log("Get factory details",factory.deploymentTransaction)

}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exit(1);
});
