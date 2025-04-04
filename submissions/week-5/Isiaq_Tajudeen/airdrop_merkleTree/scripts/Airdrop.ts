import { ethers } from "hardhat";
import { parseUnits } from "ethers";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";
import { time } from "@nomicfoundation/hardhat-network-helpers";

async function main() {
  "################## CHecking accounts.... ##################";

  const [signer, user1, user2] = await ethers.getSigners();

  console.log("Available accounts ⬇");
  console.table([signer.address, user1.address, user2.address]);

  // Deploy USDB Token
  console.log(
    "################## Deploying USDB Contract.... ##################"
  );
  const USDB = await ethers.getContractFactory("USDB");
  const usdb = await USDB.deploy();
  const usdbAddr = await usdb.getAddress();
  const usdbOwner = await ethers.getSigner(await usdb.owner());

  console.log("USDB deployed to:", usdb.target);
  console.log("USDB owner:", await usdbOwner.getAddress());

  // Deploy Airdrop Contract
  console.log(
    "################## Deploying Airdrop Contract.... ##################"
  );
  const userData = [
    { address: user1.address, amount: parseUnits("100", 18) },
    { address: user2.address, amount: parseUnits("1000", 18) },
  ];

  const createMerkleTreeFromUserData = (userData: any) => {
    const leaves = userData.map((data: any) =>
      ethers.solidityPackedKeccak256(
        ["address", "uint256"],
        [data.address, data.amount]
      )
    );

    return new MerkleTree(leaves, keccak256, { sortPairs: true });
  };

  console.log("Eligible users⬇");
  console.table(userData);

  const merkleTree = createMerkleTreeFromUserData(userData);
  const rootHash = merkleTree.getRoot();
  const merkleRootHashToString = "0x" + rootHash.toString("hex");

  const startTime = (await time.latest()) + 60; // Starts in 1 minute
  const endTime = startTime + 86400; // End in 24 hrs

  const Airdrop = await ethers.getContractFactory("Airdrop");
  const airdrop = await Airdrop.deploy(
    merkleRootHashToString,
    usdbAddr,
    startTime,
    endTime
  );

  const airdropAddr = await airdrop.getAddress();

  console.log("Airdrop deployed to:", airdropAddr);

  // Mint USDB tokens to the user
  console.log("########## Minting USDB tokens to user... ##########");
  const mintTx = await usdb
    .connect(usdbOwner)
    .mint(airdropAddr, parseUnits("900000", 18));
  await mintTx.wait();
  console.log("Minted 900000 USDB to user.");

  console.log("########## Claiming Airdrop... ##########");

  await time.increaseTo(startTime + 1);

  const userIndex = 0; // account2's data
  const leaf = ethers.solidityPackedKeccak256(
    ["address", "uint256"],
    [userData[userIndex].address, userData[userIndex].amount]
  );
  const proof = merkleTree.getProof(leaf);
  const proofHex = proof.map((p) => "0x" + p.data.toString("hex"));

  console.log({ leaf: leaf, proof: proof, proofHex: proofHex });

  const claimTx = await airdrop
    .connect(user1)
    .claimAirdrop(userData[userIndex].amount, proofHex);
  await claimTx.wait();
  console.log("Airdrop claimed successfully!");

  console.log(
    "User's final balance:",
    (await usdb.balanceOf(user1)).toString()
  );

  console.log("########## Withdrawing Remaining Tokens... ##########");
  const withdrawRemainingTokensTx = await airdrop
    .connect(signer)
    .withdrawRemainingTokens();
  await withdrawRemainingTokensTx.wait();
  console.log(
    "Owner's final balance:",
    (await usdb.balanceOf(signer)).toString()
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
