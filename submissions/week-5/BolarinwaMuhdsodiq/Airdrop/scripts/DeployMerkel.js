const hre = require("hardhat");

async function main() {

    

    const MerkleAirdrop = await hre.ethers.getContractFactory("MerkelAirdrop");

    const MyToken = await hre.ethers.getContractFactory("MyToken");

    const merkleRoot = "0xaa5d581231e596618465a56aa0f5870ba6e20785fe436d5bfb82b08662ccc7c4";


    
    const myToken = await MyToken.deploy()

    await myToken.waitForDeployment()
    const tokenAddress = await myToken.getAddress();
    console.log(tokenAddress);

    const event = await MerkleAirdrop.deploy(merkleRoot, tokenAddress);

    await event.waitForDeployment();
    const address = await event.getAddress()


    console.log(
        `deployed to Airdrop address ${address.toString()}}`
    );
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});