const hre = require("hardhat");

async function main() {
    

    const Lock = await hre.ethers.getContractFactory("Ballot");
    const lock = await Lock.deploy();


    await lock.waitForDeployment();

    const address = await lock.getAddress()


    console.log(
        `deployed to ${address.toString()}}`
    );
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});