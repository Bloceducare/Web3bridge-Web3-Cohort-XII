import { ethers, hre } from "hardhat";  // Correct imports

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const Agreement = await ethers.getContractFactory("Agreement");
  
  // Define the deployment parameters (amount and partyB address)
  const amount = ethers.parseEther("1.0"); // 1 ETH deposit
  const partyB = "0xPartyBAddress";  // Replace with actual PartyB address
  
  // Deploy the contract
  const agreement = await Agreement.deploy(partyB, amount, { value: amount });
  console.log("Agreement contract deployed to:", agreement.address);
  
  // Wait for the contract to be mined
  await agreement.deployed();
  console.log("Contract successfully deployed!");

  // Verify the contract on Etherscan
  console.log("Verifying contract on Etherscan...");
  await verifyContract(agreement.address, [partyB, amount]);
}

async function verifyContract(contractAddress: string, constructorArgs: any[]) {
  console.log("Verifying contract at:", contractAddress);
  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: constructorArgs,
    });
    console.log("Contract verified successfully!");
  } catch (error) {
    console.error("Verification failed:", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
