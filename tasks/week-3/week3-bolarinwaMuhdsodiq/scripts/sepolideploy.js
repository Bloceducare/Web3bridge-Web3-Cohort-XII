const hre = require("hardhat");

async function main() {
    

    const Ballot = await hre.ethers.getContractFactory("Ballot");
    const ballot = await Ballot.deploy();


    await ballot.waitForDeployment();

    const address = await ballot.getAddress()


    console.log(
        `deployed to ${address.toString()}}`
    );
    console.log("Deploy successfully")
}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});