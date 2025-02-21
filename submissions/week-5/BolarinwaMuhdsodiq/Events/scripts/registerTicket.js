const { ethers } = require("hardhat");

async function main() {
    const contractAddress = "0x775f79F88F67C4fD79903Ff9f9313c2eF3f033c5"; 
  const Event = await ethers.getContractFactory("Event");
//   const eventContract = await Event.deploy();
//   await eventContract.waitForDeployment();
const eventContract = await Event.attach(contractAddress); 

  console.log("Event deployed to:", eventContract.target);

  const title = "Sample Event";
  const description = "This is a sample event.";
  const startDate = (await ethers.provider.getBlock("latest")).timestamp + 1000;
  const endDate = startDate + 10000;
  const eventType = 1;
  const expectedGuestCount = 100;
  const tokenURI = "https://ticket.com/jjj";

  await eventContract.createEvent(
    title,
    description,
    startDate,
    endDate,
    eventType,
    expectedGuestCount,
    tokenURI,
    2
  );
  console.log("Event created successfully");

  const [owner, otherAccount] = await ethers.getSigners();
  const registerTx = await eventContract
    .connect(owner)
    .registerForEvent(1);
  await registerTx.wait();
  console.log("User registered for the event!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

// npx hardhat run scripts/interact.js --network
