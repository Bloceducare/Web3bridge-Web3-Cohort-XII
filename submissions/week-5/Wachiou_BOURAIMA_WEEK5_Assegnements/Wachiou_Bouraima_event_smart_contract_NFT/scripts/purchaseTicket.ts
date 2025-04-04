import { time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import hre from "hardhat";
import { vars } from "hardhat/config";



async function main() {

    const CONTRAT_ADDRESS =  "0x5FbDB2315678afecb367f032d93F642f64180aa3";

    const eventTitle = "Tech Conference";
    const eventDesc = "A conference about technology";
    const availableTikets = 50;
    const startTime = (await time.latest()) + 604800;
    const endTime = startTime + 86400;
    const eventType = 0;


    const [owner, user1] = await hre.ethers.getSigners();

    const EventContract = await hre.ethers.getContractAt("EventContract", CONTRAT_ADDRESS);

    const tx = await EventContract.connect(user1).createEvent(eventTitle, eventDesc, startTime, endTime, eventType, availableTikets);
    await EventContract.connect(user1).createEventTicket(1, eventTitle, "TC");
    const ticket = await EventContract.connect(user1).purchaseTicket(1, user1.address);

    tx.wait();
    console.log(tx);
    console.log(ticket);


}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});