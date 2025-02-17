import hre from "hardhat";



async function main() {
    const CONTRAT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";


    const [owner, user1] = await hre.ethers.getSigners();

    const EventContract = await hre.ethers.getContractAt("EventContract", CONTRAT_ADDRESS);

    const tx = await EventContract.connect(user1).registerForEvent(1); 

    tx.wait();
    console.log(tx);

    console.log("Event registered successfully");

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});