import { ethers, run } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy the ERC20 token
  const MyToken = await ethers.getContractFactory("MyToken");
  const myToken = await MyToken.deploy(ethers.utils.parseEther("1000000")); // 1 million tokens
  await myToken.deployed();
  console.log("MyToken deployed to:", myToken.address);

  // Verify the MyToken contract
  console.log("Verifying MyToken on Etherscan...");
  try {
    await run("verify:verify", {
      address: myToken.address,
      constructorArguments: [ethers.utils.parseEther("1000000")],
    });
    console.log("MyToken verified on Etherscan!");
  } catch (error) {
    console.error("Error verifying MyToken:", error);
  }

  // Deploy the Airdrop contract
  const Airdrop = await ethers.getContractFactory("Airdrop");
  const airdrop = await Airdrop.deploy(myToken.address);
  await airdrop.deployed();
  console.log("Airdrop deployed to:", airdrop.address);

  // Verify the Airdrop contract
  console.log("Verifying Airdrop on Etherscan...");
  try {
    await run("verify:verify", {
      address: airdrop.address,
      constructorArguments: [myToken.address],
    });
    console.log("Airdrop verified on Etherscan!");
  } catch (error) {
    console.error("Error verifying Airdrop:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
