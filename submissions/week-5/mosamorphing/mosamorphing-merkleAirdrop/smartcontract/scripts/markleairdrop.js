const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const MerkleAirdrop = await hre.ethers.getContractFactory("MerkleAirdrop");
    const merkleAirdrop = await MerkleAirdrop.deploy("TOKEN_ADDRESS", "MERKLE_ROOT");

    await merkleAirdrop.deployed();
    console.log("MerkleAirdrop deployed to:", merkleAirdrop.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});