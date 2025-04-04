require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.LISK_RPC);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const eventContractAddress = "0x01dA771AD0fC40a97F65Bebbf9AD23d218463723"; 
  const eventContract = await ethers.getContractAt("EventContract", eventContractAddress, wallet);

  console.log("Connected to contract:", eventContractAddress);

  // CREATE AN EVENT
  console.log("Creating a new event...");
  let tx = await eventContract.createEvent(
    "Blockchain Conference",
    "A blockchain-focused conference",
    Math.floor(Date.now() / 1000) + 86400,
    Math.floor(Date.now() / 1000) + 172800,
    1,
    100
  );
  let receipt = await tx.wait();
  console.log(receipt);
  console.log("Event created! Event hash: ", receipt.hash);
  // let eventId = receipt.events[0].args._id;
  // console.log("Event created! Event ID: ", eventId.toString());

  // CREATE EVENT TICKET
  console.log(" Creating event ticket...");
  tx = await eventContract.createEventTicket(4, "VIP Ticket", "VIP");
  await tx.wait();
  console.log("Ticket created!");

  const [signer] = await ethers.getSigners();

  // REGISTER FOR EVENT
  console.log("Registering for the event...");
  tx = await eventContract.connect(signer).registerForEvent(4, {
    value: ethers.parseEther("0.1"), // Sending ETH for a paid event
  });
  await tx.wait();
  console.log("Registered for the event!");

  // VERIFY ATTENDANCE
  console.log("Verifying attendance...");
  tx = await eventContract.verifyAttendance(3, wallet.address);
  await tx.wait();
  console.log("Attendance verified!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
