

const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect, assert } = require("chai");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require('keccak256');

describe("MerkelAirdrop", async () => {
    
      let merkleRoot, merkleTree;
      let users = [];
    

  async function deploymerkleAirdrop() {
    // const merkleRoot =
    //   "0xaa5d581231e596618465a56aa0f5870ba6e20785fe436d5bfb82b08662ccc7c4";

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount1, otherAccount2, otherAccount3, otherAccount4] = await ethers.getSigners();

    users = [
      { address: otherAccount1.address, amount: 100 },
      { address: otherAccount2.address, amount: 100 },
      { address: otherAccount3.address, amount: 100 },
    ];

    const leaves = users.map((user) =>
      keccak256(
        ethers.solidityPacked(
          ["address", "uint256"],
          [user.address, user.amount]
        )
      )
    );
    
    // Create a Merkle Tree using the leaves
    merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    
    // Get the Merkle Root from the Merkle Tree
    merkleRoot = merkleTree.getRoot().toString("hex");


    const MerkleAirdrop = await hre.ethers.getContractFactory("MerkelAirdrop");

    const MyToken = await hre.ethers.getContractFactory("MyToken");

    const myToken = await MyToken.deploy();

  

    // console.log(tokenAddress.target);

    const merkleAirdrop = await MerkleAirdrop.deploy(`0x${merkleRoot}`, myToken.target);

        console.log(myToken.target);


    const proof1 = "0x55951e7ffe764492a02a57716b130f8c910f984d93010ae7e14d8c73ebb9a777";
    const proof2 = "0xfcee8b2f100d3056bdb7cc78f74c043bf07d3e95f1472413049cc5ed37c62ee0";
    const PROOF = [proof1, proof2]
    return { merkleAirdrop, myToken, merkleRoot, owner, otherAccount1, otherAccount2, otherAccount3, PROOF, users };
  }

  describe("Deployment", async () => {
    it("It should deploy the merkle root equal to state var merkle", async () => {
        const { merkleAirdrop, owner, myToken } = await loadFixture(deploymerkleAirdrop);
        expect(await merkleAirdrop.getMerkleRoot()).to.be.equal(`0x${merkleRoot}`);
    })

    it("It should confrim the token address", async () => {
        const { merkleAirdrop, owner, myToken } = await loadFixture(deploymerkleAirdrop);
        expect(await merkleAirdrop.getAirdropToken()).to.be.equal(myToken.target);
    })
  })

  describe("Airdrop", async () => {
    
    it("it should revert with custom error ", async () => {
        const { merkleAirdrop, owner, myToken, PROOF } = await loadFixture(deploymerkleAirdrop);
        const startingBalance = await myToken.balanceOf(owner);
        const cliamerAddress = "0x6CA6d1e2D5347Bfab1d91e883F1915560e09129D"
        console.log(owner.address, "owner")
        const newProof = [
          "0x7309c9ef128ee6afed1bbe69f4583f8ffa15a5f50328260277042a2e6125e070",
          "0xfcee8b2f100d3056bdb7cc78f74c043bf07d3e95f1472413049cc5ed37c62ee0"
        ]
        const AMOUNT_TOAIRDROP = ethers.parseEther("25");
        await myToken.mint(owner.address, ethers.parseEther("1000"));
        await myToken.connect(owner).transfer( merkleAirdrop.target, ethers.parseEther("200"));
        await expect( merkleAirdrop.claim(owner.address, AMOUNT_TOAIRDROP, newProof)).to.be.revertedWithCustomError(merkleAirdrop,'MerkelAirdrop_InvalidProof()')
      })
      it("it should claim airdrop", async () => {
        const { merkleAirdrop, owner, myToken, users, otherAccount1, otherAccount2, otherAccount3 } = await loadFixture(deploymerkleAirdrop);

        for (let user of users) {

          // For each user, create a leaf from their address and amount
          const leaf = keccak256(
            ethers.solidityPacked(
              ["address", "uint256"],
              [user.address, user.amount]
            )
          );  
        
        
        await myToken.mint(owner.address, ethers.parseEther("10000"));
        await myToken.connect(owner).transfer( merkleAirdrop.target, ethers.parseEther("400"));

          const proof = merkleTree.getHexProof(leaf);

          const verity = MerkleTree.verify(proof, leaf, `0x${merkleRoot}`)

          console.log(verity, "verify")

          

          await expect(
            merkleAirdrop.claim(user.address === otherAccount1.address
                ? otherAccount1
                : user.address === otherAccount2.address
                ? otherAccount2
                : otherAccount3, user.amount, proof)
          ).to.emit(merkleAirdrop, "Cliam");
        }
      });
        // const startingBalance = await myToken.balanceOf(owner);
        // const cliamerAddress = "0x6CA6d1e2D5347Bfab1d91e883F1915560e09129D"
        // console.log(owner.address, "owner")
        // const newProof = [
        //   "0x55951e7ffe764492a02a57716b130f8c910f984d93010ae7e14d8c73ebb9a777",
        //   "0xfcee8b2f100d3056bdb7cc78f74c043bf07d3e95f1472413049cc5ed37c62ee0"
        // ]
        
        // await merkleAirdrop.claim(owner.address, ethers.parseEther("25"), newProof);
       
        
        // expect()
        //await expect( merkleAirdrop.claim(owner.address, AMOUNT_TOAIRDROP, newProof)).to.be.revertedWithCustomError(merkleAirdrop,'MerkelAirdrop_InvalidProof()')
      })

  // })

  
  

});
