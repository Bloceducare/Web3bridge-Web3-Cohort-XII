import { ethers } from "hardhat";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";



async function main() {

    console.log("-----------------------deploy contract---------------\n\n")

    // const [user1, user2] = await ethers.getSigners();

    const users = ["0xc0dd2bFDAC5a426294BC88DEAFEB444aD98e7121", "0x6f1E48D6F8a3e7338098Cf35ee684d2c9dD43B06"]



    const tonkenName = "WassToken3";
    const tokenSymbol = "WTK4";
    const totalSupply = ethers.parseEther("10000000000000")

    const elements = users.map(user =>
        keccak256(ethers.solidityPacked(["address", "uint256"], [user, ethers.parseEther("1000000")])))
    const merkleTree = new MerkleTree(elements, keccak256, { sortPairs: true });
    const merkleRoot = merkleTree.getHexRoot();

    console.log(`Merkle root: ${merkleRoot}`);


    const airdrop = await ethers.deployContract("MyAirdrop", [merkleRoot, tonkenName, tokenSymbol, totalSupply]);

    await airdrop.waitForDeployment();

    console.log(
        `eventContract contract successfully deployed to: ${airdrop.target}`
    );


    console.log("-----------------------claim token---------------\n\n")

    const amount = ethers.parseEther("1000000");
    const leaf = keccak256(ethers.solidityPacked(["address", "uint256"], ["0x6f1E48D6F8a3e7338098Cf35ee684d2c9dD43B06", amount]));
    let proof = merkleTree.getHexProof(leaf);

    console.log(amount)

    console.log(`proof1: ${proof}`)

    // console.log(`Balance of user1 before claim: ${await airdrop.connect(user1)._balanceOf()} ${tokenSymbol}`);

    // await airdrop.claim(amount, proof);

    // console.log(`Balance of user1 before claim: ${await airdrop.connect(user1)._balanceOf()} ${tokenSymbol}`);




    console.log("-----------------------claim token------------------\n\n")


    const leaf2 = keccak256(ethers.solidityPacked(["address", "uint256"], ["0xc0dd2bFDAC5a426294BC88DEAFEB444aD98e7121", amount]));
    proof = merkleTree.getHexProof(leaf2);

    console.log(`proof2: ${proof}`)

    // console.log(`Balance of user2 before claim: ${await airdrop.connect(user2)._balanceOf()} ${tokenSymbol}`);

    // await airdrop.claim(amount, proof);

    // console.log(`Balance of user1 before claim: ${await airdrop.connect(user2)._balanceOf()} ${tokenSymbol}`);


    console.log(totalSupply)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});