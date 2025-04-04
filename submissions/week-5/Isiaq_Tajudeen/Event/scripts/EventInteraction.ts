import { parseUnits } from "ethers";
import hre from "hardhat";

async function main() {
  //   console.log(
  //     "################## Deploying contract factory.... ##################"
  //   );

  //   const event = await hre.ethers.deployContract("Event");
  //   await event.waitForDeployment();

  //   console.log({
  //     "Event contract successfully deployed to": event.target,
  //   });

  //   const DEPLOYED_EVENT_FACTORY_CONTRACT = event.target;
  const DEPLOYED_EVENT_FACTORY_CONTRACT =
    "0xfa7f2fa7D8559170E4453859De68340C93e7D99b";
  const owner = "0xA6bFcA8DAd54238a6c0951bcbA0b66A7Ace5DaAC";
  const signer = await hre.ethers.getSigner(owner);
  //   const usdt = "0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B";

  // Get USDT contract instance
  //   const usdtContract = await hre.ethers.getContractAt(
  //     "IERC20", // Use ERC20 interface
  //     usdt
  //   );

  const eventFactoryInstance = await hre.ethers.getContractAt(
    "Event",
    DEPLOYED_EVENT_FACTORY_CONTRACT
  );

  // Deploy USDB
  console.log("################## Deploying USDB.... ##################");
  const USDBContract = await hre.ethers.getContractFactory("USDB");
  const usdbContract = await USDBContract.deploy();
  const usdbAddr = await usdbContract.getAddress();
  console.log("USDB contract deployed to:", usdbAddr);

  // Create events
  console.log("################## Creating events.... ##################");
  const createEvent1 = await eventFactoryInstance
    .connect(signer)
    .createEvent("Valentine", "blablabla...", 1749399978, 1749399998, 0, 10);

  const tx1 = await createEvent1.wait();
  console.log("Create event 1 details:", tx1?.hash);

  const createEvent2 = await eventFactoryInstance
    .connect(signer)
    .createEvent(
      "Valentine Of Life",
      "blablabla...",
      1749499978,
      1749599998,
      1,
      20
    );

  const tx2 = await createEvent2.wait();
  console.log("Create event 2 details:", tx2?.hash);

  //   // Create event tickets
  //   console.log(
  //     "################## Creating events ticket.... ##################"
  //   );
  //   const nftUri1 =
  //     "https://gateway.pinata.cloud/ipfs/QmTXNQNNhFkkpCaCbHDfzbUCjXQjQnhX7QFoX1YVRQCSC8";

  //   const createEventTicket1 = await eventFactoryInstance.createEventTicket(
  //     1,
  //     0,
  //     nftUri1,
  //     "Valentine",
  //     "VAL"
  //   );

  //   const ticketTx1 = await createEventTicket1.wait();
  //   console.log("Create event ticket 1 details:", ticketTx1?.hash);

  //   const nftUri2 =
  //     "https://gateway.pinata.cloud/ipfs/bafkreicziiotaka4dp7mcnsf6p6ffl64i5szqzcqccttojhsivw5mlpokm";

  //   const createEventTicket2 = await eventFactoryInstance.createEventTicket(
  //     2,
  //     parseUnits("100", 18),
  //     nftUri2,
  //     "Valentine",
  //     "VAL"
  //   );

  //   const ticketTx2 = await createEventTicket2.wait();
  //   console.log("Create event ticket 2 details:", ticketTx2?.hash);

  // Handle registrations
  console.log("################## Registering events.... ##################");

  // First check current allowance
  const currentAllowance = await usdbContract.allowance(
    owner,
    DEPLOYED_EVENT_FACTORY_CONTRACT
  );
  console.log("Current allowance:", currentAllowance.toString());

  // Register for events
  const registerForEvent1 = await eventFactoryInstance
    .connect(signer)
    .registerForEvent(1, usdbAddr);

  const registerForEventTx1 = await registerForEvent1.wait();
  console.log("Register for event 1 details:", registerForEventTx1?.hash);

  // Set sufficient allowance for USDB
  console.log("Setting USDB allowance...");
  const usdbApproveTx = await usdbContract
    .connect(signer)
    .approve(DEPLOYED_EVENT_FACTORY_CONTRACT, parseUnits("200", 18));
  await usdbApproveTx.wait();
  console.log("USDB allowance set");

  const registerForEvent2 = await eventFactoryInstance
    .connect(signer)
    .registerForEvent(2, usdbAddr);

  const registerForEventTx2 = await registerForEvent2.wait();
  console.log("Register for event 2 details:", registerForEventTx2?.hash);
}

main().catch((error: any) => {
  console.error(error);
  process.exitCode = 1;
});
