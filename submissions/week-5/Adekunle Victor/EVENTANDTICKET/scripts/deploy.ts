import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`🚀 Deploying contracts with account: ${deployer.address}`);

  // Deploy EventContract
  console.log("🚀 Deploying EventContract...");
  const EventContract = await ethers.getContractFactory("EventContract");
  const event = await EventContract.deploy();
  await event.waitForDeployment();
  console.log(`✅ EventContract successfully deployed at: ${event.target}`);

  // Define constructor arguments for TicketNFT
  const factoryAddress = event.target;  // Assuming EventContract is the factory
  const name = "EventTicket";
  const symbol = "ETKT";
  const ticketPrice = ethers.parseEther("0.05"); // 0.05 ETH per ticket
  const maxTicketPerUser = 5;
  const organizerAddress = deployer.address;
  const freeTicketSVG = "<svg>Free Ticket SVG</svg>";
  const paidTicketSVG = "<svg>Paid Ticket SVG</svg>";

  // Deploy TicketNFT with correct arguments
  console.log("🚀 Deploying TicketNFT...");
  const TicketNFT = await ethers.getContractFactory("TicketNFT");
  const ticketNFT = await TicketNFT.deploy(
    factoryAddress,
    name,
    symbol,
    ticketPrice,
    maxTicketPerUser,
    organizerAddress,
    freeTicketSVG,
    paidTicketSVG
  );
  await ticketNFT.waitForDeployment();
  console.log(`✅ TicketNFT successfully deployed at: ${ticketNFT.target}`);
}

// Execute Deployment
main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
