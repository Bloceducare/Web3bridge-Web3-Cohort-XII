import { ethers } from "hardhat";
import { SalesAgreement } from "../typechain-types";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { HardhatUserConfig, vars } from "hardhat/config";
async function main() {
  // Create wallet instances from private keys
  const BASE_SEPOLIA_URL = vars.get("BASE_SEPOLIA_URL");
  const PRIVATE_KEY = vars.get("PRIVATE_KEY");
  const PRIVATE_KEY_1 = vars.get("PRIVATE_KEY_1");
  const PRIVATE_KEY_2 = vars.get("PRIVATE_KEY_2");
  const PRIVATE_KEY_3 = vars.get("PRIVATE_KEY_3");
  const BASE_API_KEY = vars.get("BASE_API_KEY");
  const ETHERSCAN_API_KEY = vars.get("ETHERSCAN_API_KEY");

  const provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_URL);

  const deployer = new ethers.Wallet(PRIVATE_KEY, provider);
  const buyer = new ethers.Wallet(PRIVATE_KEY_1, provider);
  const escrowAgent = new ethers.Wallet(PRIVATE_KEY_2, provider);

  // Log addresses to verify
  console.log("Using addresses:");
  console.log("Deployer:", deployer.address);
  console.log("Buyer:", buyer.address);
  console.log("Escrow Agent:", escrowAgent.address);

  // 1. Get existing contract
  async function getContract(): Promise<SalesAgreement> {
    const contractAddress = "0x7b5F8074C53bF870bFed71B97d03b9aD0a705888";
    const SalesAgreement = await ethers.getContractFactory(
      "salesAgreement",
      deployer
    );
    const contract = SalesAgreement.attach(
      contractAddress
    ) as unknown as SalesAgreement;
    console.log("Using contract at:", contractAddress);
    return contract;
  }

  // 2. Create an agreement
  async function createAgreement(contract: SalesAgreement) {
    const oneWeek = 7 * 24 * 60 * 60; // 1 week in seconds
    const deliveryDate = Math.floor(Date.now() / 1000) + oneWeek;

    console.log("Creating agreement with parameters:");
    console.log("Buyer address:", buyer.address);
    console.log("Escrow agent address:", escrowAgent.address);
    console.log("Delivery date:", deliveryDate);

    const tx = await contract.createAgreement(
      "Laptop", // item name
      "MacBook Pro M1", // description
      ethers.parseEther("1"), // price (1 ETH)
      buyer.address, // buyer address
      ethers.ZeroAddress, // payment token (ETH)
      BigInt(deliveryDate), // Convert to BigInt
      true, // use escrow
      escrowAgent.address,
      true, // refundable
      0 // COURT dispute resolution
    );

    const receipt = await tx.wait();
    console.log("Agreement created with ID: 0");
    return 0;
  }

  // 3. Confirm agreement (buyer sends payment)
  async function confirmAgreement(
    contract: SalesAgreement,
    agreementId: number
  ) {
    console.log("Confirming agreement as buyer:", buyer.address);

    const buyerContract = contract.connect(buyer);
    const tx = await buyerContract.confirmAgreement(agreementId, {
      value: ethers.parseEther("1"),
    });
    await tx.wait();
    console.log("Agreement confirmed by buyer");
  }

  // 4. Release escrow
  async function releaseEscrow(contract: SalesAgreement, agreementId: number) {
    console.log("Releasing escrow as agent:", escrowAgent.address);

    const escrowContract = contract.connect(escrowAgent);
    const tx = await escrowContract.releaseEscrow(agreementId);
    await tx.wait();
    console.log("Escrow released by escrow agent");
  }

  // Execute all steps in sequence
  try {
    console.log("Starting automated interaction sequence...");

    const contract = await getContract();
    console.log("\nStep 1: Contract connection completed");

    const agreementId = await createAgreement(contract);
    console.log("\nStep 2: Agreement creation completed");

    await confirmAgreement(contract, agreementId);
    console.log("\nStep 3: Agreement confirmation completed");

    // Simulate waiting for delivery date
    console.log("\nWaiting for delivery date...");
    await time.increase(7 * 24 * 60 * 60); // Increase time by 1 week

    await releaseEscrow(contract, agreementId);
    console.log("\nStep 4: Escrow release completed");

    console.log("\nAll steps completed successfully!");
  } catch (error) {
    console.error("Error during execution:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
