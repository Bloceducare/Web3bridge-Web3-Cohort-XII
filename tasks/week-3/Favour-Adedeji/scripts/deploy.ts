const hre = require("hardhat")

async function main() {
    const BallotContract = await hre.ethers.getContractFactory("Ballot")
    const ballotContract = await BallotContract.deploy()

    await ballotContract.waitForDeployment()

    console.log("Contract deployed to:", await ballotContract.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
