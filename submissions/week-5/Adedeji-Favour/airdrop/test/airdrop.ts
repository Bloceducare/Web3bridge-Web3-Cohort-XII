import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";


describe("Airdrop", () => {
  async function deployAirdrop() {
    const [owner, account1, account2, account3, account4] = await hre.ethers.getSigners()

    const initiaSupply = hre.ethers.parseEther("5000000000")

    const tokenFactory = await hre.ethers.getContractFactory("Token")
    const deployedToken = await tokenFactory.deploy(initiaSupply)
    
    const airdropContractFactory = await hre.ethers.getContractFactory("Airdrop")
    const deployedContract = await airdropContractFactory.deploy(deployedToken.target)
    const contractAddress = await deployedContract.getAddress()

    await deployedToken.transfer(contractAddress, hre.ethers.parseEther("100000"))

    const userClaims = [
      { address: account1.address, amount: 100 },
      { address: account2.address, amount: 200},
      { address: account3.address, amount: 500 },
    ];

  // Generate Leaves for Merkle Tree
  const leaves = userClaims.map(user => keccak256(hre.ethers.solidityPacked(["address", "uint256"], [user.address, user.amount])));
  const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  const merkleRoot = merkleTree.getHexRoot();

    return {deployedContract, deployedToken, owner, account1, account4, merkleTree, merkleRoot, leaves, userClaims}
  }

  describe("Deployment", () => {
    it("should test the deployer", async () => {
      const {deployedContract, owner} = await loadFixture(deployAirdrop)

      const deployer = await deployedContract.runner

      expect(deployer).to.equal(owner)
    })

    it("should assign constant variables its value", async () => {
      const {deployedContract} = await loadFixture(deployAirdrop)

      const max_amount = await deployedContract.MAX_AMOUNT()

      expect(max_amount).to.equal(hre.ethers.parseEther("1000"))
    })
  })

  describe("Set MarkleRoot", () => {
    it("should set merkle root by owner", async () => {
      const {deployedContract, merkleRoot} = await loadFixture(deployAirdrop)

      await deployedContract.setMerkleRoot(merkleRoot)
      
      expect(await deployedContract.merkleRoot()).to.equal(merkleRoot)
    })

    it("should revert if set merkle root is called by another user aside than owner", async () => {
      const {deployedContract, account1, merkleRoot} = await loadFixture(deployAirdrop)

      expect(deployedContract.connect(account1).setMerkleRoot(merkleRoot)).to.reverted
    })
  })

  describe("Claim", () => {
    it("should be able to claim airdrop", async () => {
      const {deployedContract, deployedToken, merkleRoot, userClaims, account1, merkleTree} = await loadFixture(deployAirdrop)

      await deployedContract.setMerkleRoot(merkleRoot)

      const amount = userClaims[0].amount
      const leaf = keccak256(hre.ethers.solidityPacked(["address", "uint256"], [account1.address, amount]))
      const proof = merkleTree.getHexProof(leaf)

      await deployedContract.connect(account1).claim(amount, proof)

      expect(await deployedToken.balanceOf(account1.address)).to.equal(amount)
    })

    it("should emit event after airdrop successfully sent", async () => {
      const {deployedContract, merkleRoot, userClaims, account1, merkleTree} = await loadFixture(deployAirdrop)

      await deployedContract.setMerkleRoot(merkleRoot)

      const amount = userClaims[0].amount
      const leaf = keccak256(hre.ethers.solidityPacked(["address", "uint256"], [account1.address, amount]))
      const proof = merkleTree.getHexProof(leaf)

      expect(await deployedContract.connect(account1).claim(amount, proof)).emit
    })

    it("should revert if anyone is trying to claim airdrop two times", async () => {
      const {deployedContract, merkleRoot, userClaims, account1, merkleTree} = await loadFixture(deployAirdrop)

      await deployedContract.setMerkleRoot(merkleRoot)

      const amount = userClaims[0].amount
      const leaf = keccak256(hre.ethers.solidityPacked(["address", "uint256"], [account1.address, amount]))
      const proof = merkleTree.getHexProof(leaf)

      await deployedContract.connect(account1).claim(amount, proof)
      expect(deployedContract.connect(account1).claim(amount, proof)).to.revertedWithCustomError(deployedContract, "AIRDROP_ALREADY_CLAIMED()")
    })

    it("should revert if amount is greater than max amount", async () => {
      const {deployedContract, merkleRoot, account1, merkleTree} = await loadFixture(deployAirdrop)

      await deployedContract.setMerkleRoot(merkleRoot)

      const amount = hre.ethers.parseEther("1001")
      const leaf = keccak256(hre.ethers.solidityPacked(["address", "uint256"], [account1.address, amount]))
      const proof = merkleTree.getHexProof(leaf)

      expect(deployedContract.connect(account1).claim(amount, proof)).to.revertedWithCustomError(deployedContract, "AMOUNT_TOO_HIGH()")
    })

    it("should revert if wrong proof is used in claim function", async () => {
      const {deployedContract, merkleRoot, account4, merkleTree, } = await loadFixture(deployAirdrop)

      await deployedContract.setMerkleRoot(merkleRoot)

      const amount = hre.ethers.parseEther("100")
      const wrongleaf = keccak256(hre.ethers.solidityPacked(["address", "uint256"], [account4.address, amount]))
      const proof = merkleTree.getHexProof(wrongleaf)

      expect(deployedContract.connect(account4).claim(amount, proof)).to.revertedWithCustomError(deployedContract, "INVALID_PROOF()")
    })
  })

  describe("Withdraw", () => {
    it("should be able to withdraw funds", async () => {
      const {deployedContract, deployedToken} = await loadFixture(deployAirdrop)

      await deployedContract.withdraw()

      expect(await deployedToken.balanceOf(deployedContract.target)).to.equal(0);
    })
    
    it("should check if the token truly enter the owner's account ", async () => {
      const {deployedContract, deployedToken, owner} = await loadFixture(deployAirdrop)
      
      const contractBalanceBeforeWithdrawal = await deployedToken.balanceOf(deployedContract.target)
      const ownerBalanceBeforeWithdrawal = await deployedToken.balanceOf(owner.address)

      await deployedContract.withdraw()
      
      expect(await deployedToken.balanceOf(owner.address)).to.equal(contractBalanceBeforeWithdrawal + ownerBalanceBeforeWithdrawal);
    })
    
    it("should revert if any other user attempt to withdraw funds", async () => {
      const {deployedContract, account1} = await loadFixture(deployAirdrop)
      
      expect(deployedContract.connect(account1).withdraw()).to.reverted
    })
    
    it("should revert if balance equal to zero", async () => {
      const {deployedContract} = await loadFixture(deployAirdrop)
      await deployedContract.withdraw()
      
      expect(deployedContract.withdraw()).to.revertedWithCustomError(deployedContract, "INSUFFICIENT_BALANCE()")
    })
  })
})