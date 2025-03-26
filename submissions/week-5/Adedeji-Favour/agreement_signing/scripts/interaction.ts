const { ethers } = require("hardhat");

async function main() {
  const [deployer, buyer, seller] = await ethers.getSigners();

  // Deploy ERC20 token
  const Token = await ethers.getContractFactory("AgreementSigning");
  const token = await Token.deploy("Token", "TKN");
  await token.waitForDeployment();
  console.log(`Token deployed at: ${await token.getAddress()}`);

  // Deploy AgreementSigning contract
  const AgreementSigning = await ethers.getContractFactory("AgreementSigning");
  const agreementSigning = await AgreementSigning.deploy(await token.getAddress());
  await agreementSigning.waitForDeployment();
  console.log(`AgreementSigning deployed at: ${await agreementSigning.getAddress()}`);

  // Fund buyer with tokens
  await token.transfer(buyer.address, ethers.parseEther("100"));
  console.log(`Transferred 100 TKN to buyer: ${buyer.address}`);

  // Create an agreement
  const AGREEMENT_PRICE = ethers.parseEther("10");
  const DEADLINE = Math.floor(Date.now() / 1000) + 86400; // 1 day later
  let tx = await agreementSigning.connect(buyer).createAgreement(
    seller.address,
    "Car Sale",
    "Selling a used car",
    AGREEMENT_PRICE,
    DEADLINE
  );
  await tx.wait();
  console.log("Agreement created");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
