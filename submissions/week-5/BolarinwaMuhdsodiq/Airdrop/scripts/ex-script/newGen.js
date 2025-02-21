const { MerkleTree } = require('merkletreejs');
const { ethers } = require('hardhat');

async function generateMerkleData() {
  // Whitelist with multiple entries
  const whitelist = [
    {
      address: "0x6CA6d1e2D5347Bfab1d91e883F1915560e09129D",
      amount: ethers.parseEther("25").toString()
    },
    {
      address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      amount: ethers.parseEther("30").toString()
    }
  ];

  // Create leaves with EXACT same encoding as contract
  const leaves = whitelist.map(x => 
    ethers.solidityPackedKeccak256(
      ["address", "uint256"],
      [x.address, x.amount]
    )
  );

  // Create sorted Merkle tree
  const tree = new MerkleTree(leaves, ethers.keccak256, { sort: true });
  
  console.log("Merkle Root:", tree.getHexRoot());
  
  // Get proof for first address
  const leaf = leaves[0];
  const proof = tree.getHexProof(leaf);
  console.log("Proof for", whitelist[0].address, ":", proof);
  console.log("Proof for", whitelist[1].address, ":", proof);
}

generateMerkleData();