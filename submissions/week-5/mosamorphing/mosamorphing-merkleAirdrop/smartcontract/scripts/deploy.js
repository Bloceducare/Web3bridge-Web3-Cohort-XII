const hre = require("hardhat");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy the ERC20 Token
  const MyToken = await hre.ethers.getContractFactory("MyToken");
  const myToken = await MyToken.deploy(ethers.parseEther("1000000")); // 1M tokens
  await myToken.deployed();
  console.log("MyToken deployed to:", myToken.address);

  // Generate Merkle Tree
  const whitelist = [
    { address: "0x564268FbC519C6bD202C877f6fbc9F2068d3BF53", amount: 10000 },
    // Add more addresses and amounts here
  ];
  const leaves = whitelist.map((x) =>
    keccak256(Buffer.concat([Buffer.from(x.address.replace("0x", ""), "hex"), Buffer.from(x.amount.toString())]))
  );
  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  const root = tree.getRoot().toString("hex");

  // Deploy the MerkleAirdrop contract
  const MerkleAirdrop = await hre.ethers.getContractFactory("MerkleAirdrop");
  const merkleAirdrop = await MerkleAirdrop.deploy(myToken.address, root);
  await merkleAirdrop.deployed();
  console.log("MerkleAirdrop deployed to:", merkleAirdrop.address);

  // Transfer tokens to the MerkleAirdrop contract
  await myToken.transfer(merkleAirdrop.address, ethers.parseEther("100000"));
  console.log("Transferred tokens to MerkleAirdrop contract");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});