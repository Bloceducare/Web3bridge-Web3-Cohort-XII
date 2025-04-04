const { ethers } = require("hardhat");
const keccak256 = require("keccak256");
const { MerkleTree } = require("merkletreejs");

async function main() {
    let merkleRoot, merkleTree;
    let users = [
        { address: "0x8822F2965090Ddc102F7de354dfd6E642C090269", amount: 100 },
        { address: "0x9dBa18e9b96b905919cC828C399d313EfD55D800", amount: 100 },
    ];

    const leaves = users.map((user) => keccak256(ethers.solidityPacked(
        ["address", "uint256"],
        [user.address, user.amount]
    )));

    const owner = "0x8822F2965090Ddc102F7de354dfd6E642C090269";

    merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    merkleRoot = merkleTree.getRoot().toString("hex");

    const MerkleAirdrop = await ethers.getContractFactory("MerkelAirdrop");
    const MyToken = await ethers.getContractFactory("MyToken");

    const myToken = await MyToken.deploy();
    await myToken.waitForDeployment();

    const tokenAddress = await myToken.getAddress();  // Ensure valid address
    console.log("Token contract deployed to:", tokenAddress);
    console.log("------------Deploying airdrop------");
    const merkleAirdrop = await MerkleAirdrop.deploy(`0x${merkleRoot}`, tokenAddress);
    await merkleAirdrop.waitForDeployment();
    console.log("------------Deployed airdrop------");

    console.log("Airdrop contract deployed to:", await merkleAirdrop.getAddress());

    console.log("------------Mint token------");

    await myToken.mint(owner, ethers.parseEther("10000"));
    

    const [deployer] = await ethers.getSigners();
    await myToken.mint(deployer, ethers.parseEther("10000"));
    await myToken.connect(deployer).transfer(await merkleAirdrop.getAddress(), ethers.parseEther("400"));

    console.log("------------Token Minted and Transferred------");

    console.log("------------Claiming Token Airdrop------");

    const userToClaim = users[0]; // 👈 Change this to choose the claimer
    console.log(userToClaim, "User To Claim")
    const leaf = keccak256(ethers.solidityPacked(["address", "uint256"], [userToClaim.address, userToClaim.amount]));
    const proof = merkleTree.getHexProof(leaf);

    console.log(`Claiming for address: ${userToClaim.address}`);
    console.log(`Merkle Proof:`, proof);


    console.log(`Claiming for address: ${userToClaim.address}`)

    const claimTx = merkleAirdrop.claim(userToClaim.address, userToClaim.amount, proof);

    await claimTx;

    // console.log(claimTx)

    console.log("Operation successful");
    
    console.log("-------Airdrop token--------")
    const getTokenAddress = await merkleAirdrop.getAirdropToken();

    console.log(getTokenAddress, "Token Address")

    console.log("-------Airdrop Merkle Root--------")

    const getMerkleRoot = await merkleAirdrop.getMerkleRoot();

    console.log(getMerkleRoot, "Merkle Root")
    
    console.log("Operation Successfully")

   

    
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
