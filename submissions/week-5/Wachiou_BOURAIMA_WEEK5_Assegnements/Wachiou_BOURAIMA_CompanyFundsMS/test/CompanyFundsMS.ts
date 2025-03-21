import { expect } from "chai";
import hre from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";

describe("CompanyFundsMS", function () {
  async function deployContractFixture() {
    const [owner, ...Members] = await hre.ethers.getSigners();
    const tokenFactory = await hre.ethers.getContractFactory("ERC20Token");
    const token = await tokenFactory.deploy("TestToken", "TTK", 1000000);

    console.log(await token.owner() === owner.address);

    let members = 21;
    let boardMembers = [];
    let noBoardMembers = [];
    boardMembers[0] = owner;
    for (let i = 1; i < members; i++) {
      const member = await hre.ethers.getSigners();
      boardMembers.push(Members[i]);
      if (i == 20) {
        const noMember = await hre.ethers.getSigners();
        noBoardMembers.push(Members[i]);

      }
    }
    
    

    const elements = boardMembers.map(member =>
      keccak256(hre.ethers.solidityPacked(["address"], [member.address]))
    );
    const merkleTree = new MerkleTree(elements, keccak256, { sortPairs: true });
    const merkleRoot = merkleTree.getHexRoot();

    const contractFactory = await hre.ethers.getContractFactory("CompanyFundsMS");
    const contract = await contractFactory.deploy(token.target, merkleRoot);

    return { owner, Members, contract, token, boardMembers, merkleTree, noBoardMembers };
  }

  describe("Deployment", function () {
    it("should deploy correctly with 20 board members", async function () {
      const { contract, boardMembers } = await loadFixture(deployContractFixture);
      const addrZEro = "0x"

      expect(contract.target).not.equal(addrZEro);
      ;
    });
  });

  describe("Expense Workflow", function () {
    it("should allow the owner to create an expense", async function () {
      const { contract, owner, merkleTree } = await loadFixture(deployContractFixture);
      await contract.connect(owner).setMonthlyBudget(1000);
      const leaf = keccak256(hre.ethers.solidityPacked(["address"], [owner.address]));
      const proof = merkleTree.getHexProof(leaf);
      const date = Date.now() + 86400;
      await expect(contract.connect(owner).createExpenses(
        proof,
        500,
        date,
        "Office rent"
      )).to.emit(contract, "ExpenseCreated").withArgs(1, 500, date, "Office rent");
    });

    it("should allow board members to sign an expense", async function () {
      const { contract, owner, boardMembers, merkleTree } = await loadFixture(deployContractFixture);
      const expenseId = 1;
      await contract.connect(owner).setMonthlyBudget(1000);
      let leaf = keccak256(hre.ethers.solidityPacked(["address"], [owner.address]));
      let proof = merkleTree.getHexProof(leaf);
      const date = Date.now() + 86400;
      await contract.connect(owner).createExpenses(
        proof,
        500,
        date,
        "Office rent"
      )
      
        const member = boardMembers[1];
        leaf = keccak256(hre.ethers.solidityPacked(["address"], [member.address]));
        proof = merkleTree.getHexProof(leaf);
        await expect(contract.connect(member).signExpenses(proof, expenseId))
          .to.emit(contract, "Signed").withArgs(member.address, expenseId);
      
    });



    it("should revert if expense amount exceeds budget", async function () {
      const { contract, owner , merkleTree  } = await loadFixture(deployContractFixture);
      const expenseId = 1;
      await contract.connect(owner).setMonthlyBudget(1000);
      const leaf = keccak256(hre.ethers.solidityPacked(["address"], [owner.address]));
      const proof = merkleTree.getHexProof(leaf);
      const date = Date.now() + 86400;
      await contract.connect(owner).setMonthlyBudget(1000);
      await expect(contract.connect(owner).createExpenses(
        proof,
        1500,
        Date.now() + 86400,
        "Excessive expense"
      )).to.be.revertedWithCustomError(contract, "evalidamount");
    });

    it("should revert if the date is in the past", async function () {
      const { contract, owner, merkleTree } = await loadFixture(deployContractFixture);
      const leaf = keccak256(hre.ethers.solidityPacked(["address"], [owner.address]));
      const proof = merkleTree.getHexProof(leaf);
      await contract.connect(owner).setMonthlyBudget(1000);
      await time.increase(86400);
      await expect(contract.connect(owner).createExpenses(
        proof,
        500,
        86400,
        "Invalid date"
      )).to.be.revertedWithCustomError(contract, "InvalidDate");
    });

    it("should revert if  no  board member want to sign", async function () {
      const { Members, contract, noBoardMembers, owner, boardMembers, merkleTree } = await loadFixture(deployContractFixture);
      const expenseId = 1;
      await contract.connect(owner).setMonthlyBudget(1000);
      let leaf = keccak256(hre.ethers.solidityPacked(["address"], [owner.address]));
      let proof = merkleTree.getHexProof(leaf);
      const date = Date.now() + 86400;
      await contract.connect(owner).createExpenses(
        proof,
        500,
        date,
        "Office rent"
      )
      leaf = keccak256(hre.ethers.solidityPacked(["address"], [Members[28].address]));
      proof = merkleTree.getHexProof(leaf);
      await expect(contract.connect(Members[28]).signExpenses(proof, expenseId))
        .to.be.revertedWithCustomError(contract, "InvalidProof");
    });
    it("it should release funds if all board members sign", async function () {
      const { token, Members, contract, owner, boardMembers, merkleTree } = await loadFixture(deployContractFixture);
      const expenseId = 1;
      await contract.connect(owner).setMonthlyBudget(1000);
      let leaf = keccak256(hre.ethers.solidityPacked(["address"], [owner.address]));
      let proof = merkleTree.getHexProof(leaf);
      const date = Date.now() + 86400;
      await contract.connect(owner).createExpenses(
        proof,
        500,
        date,
        "Office rent"
      )
      
      await token.transfer(contract.target, 1000);
      for (let i = 0; i < 20; i++) {
        leaf = keccak256(hre.ethers.solidityPacked(["address"], [boardMembers[i].address]));
        proof = merkleTree.getHexProof(leaf);
        await contract.connect(boardMembers[i]).signExpenses(proof, expenseId);
      }
      await expect(contract.connect(owner).claimExpenses(expenseId))
        .to.emit(contract, "Released").withArgs(expenseId, 500);
    });
  });
});

