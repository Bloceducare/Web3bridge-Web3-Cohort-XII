import { ethers } from "hardhat";

async function deploy() {
  console.log("\nStarting deployment process...");
  
  console.log("\n Deploying Token contract...");
  const token = await ethers.deployContract("Token", ["Leo Token", "LTK"]);
  await token.waitForDeployment();
  console.log("Token contract deployed successfully");
  console.log("Address:", token.target);
  
  
  console.log("\nDeploying AgreementFactory contract...");
  const agreement = await ethers.deployContract("AgreementFactory", [token.target]);
  await agreement.waitForDeployment();
  console.log("AgreementFactory contract deployed successfully");
  console.log("Address:", agreement.target);
  console.log("Using Token at:", token.target);

  return { token, agreement };
}

async function createAgreement(agreementContract) {
  console.log("\nCreating new agreement...");
  const amount = ethers.parseUnits("100", 18);
  
  const tx = await agreementContract.createAgreement("My rent", amount);
  console.log("Transaction sent:", tx.hash);
  
  await tx.wait();
  console.log("Agreement created successfully");
  console.log("Amount:", ethers.formatUnits(amount, 18), "tokens");
  console.log("Transaction:", tx.hash);
}

async function signAgreement(ownerAddress, agreementContract, tokenContract) {
  console.log("\n Signing agreement...");
  console.log("Signer address:", ownerAddress);

  await tokenContract.mint(ownerAddress, ethers.parseUnits("1000", 18));
  await tokenContract.approve(agreementContract.target, ethers.parseUnits("100", 18));
  
  const tx = await agreementContract.signAgreement(ownerAddress);
  console.log("Transaction sent:", tx.hash);
  
  await tx.wait();
  console.log("Agreement signed successfully");
  console.log("Transaction:", tx.hash);
}

async function main() {
  try {
    console.log("Starting deployment and agreement creation process...\n");
    
    const { token, agreement } = await deploy();
    const signer = await ethers.provider.getSigner();
    const ownerAddress = await signer.getAddress();
    
    await createAgreement(agreement);
    await signAgreement(ownerAddress, agreement, token);
    
    console.log("\n✨ All operations completed successfully!");
  } catch (error) {
    console.error("\nError occurred:", error.message);
    throw error;
  }
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});