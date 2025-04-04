import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import {ethers} from "hardhat";

describe("Budget MultiSig", function () {
    async function deployBudgetMultiSig() {
      const [owner, ...boardMembers] = await ethers.getSigners();

      const boardAddresses = boardMembers.map(member => member.address);
      boardAddresses.push(owner.address)
      
      const contractFactory = await ethers.getContractFactory("BudgetMultiSig")

      const deployedContract = await contractFactory.deploy(boardAddresses)
  
      return { deployedContract, owner, boardAddresses, boardMembers }
    }

    describe("Deployment", () => {
      it("should test the deployer", async () => {
        const {deployedContract, owner} = await loadFixture(deployBudgetMultiSig)
  
        const deployer = deployedContract.runner
  
        expect(deployer).to.equal(owner)
      })

      it("Should deploy with 20 board members", async function () {
        const {deployedContract, owner} = await loadFixture(deployBudgetMultiSig)

          expect(await deployedContract.totalBoardMembers()).to.equal(20);
      });
      
    })

    describe("Proposal", () => {

      it("Only owner can propose a budget", async function () {
        const {deployedContract, owner, boardMembers} = await loadFixture(deployBudgetMultiSig)

          await expect(deployedContract.connect(boardMembers[0]).proposeBudget(1000)).to.be.reverted;
  
          await expect(deployedContract.connect(owner).proposeBudget(1000)).to.emit
      });
  
      it("Should not allow budget proposal twice before approval", async function () {
        const {deployedContract, owner} = await loadFixture(deployBudgetMultiSig)

          await deployedContract.connect(owner).proposeBudget(5000);
          expect(deployedContract.connect(owner).proposeBudget(3000)).to.be.reverted;
      });
    })


    describe("Sign Proposal", () => {
      it("Only board members can sign the budget", async function () {
        const {deployedContract, owner, boardMembers} = await loadFixture(deployBudgetMultiSig)
        const nonBoardMember = boardMembers.pop();

          await deployedContract.connect(owner).proposeBudget(2000);
  
          expect(await deployedContract.connect(boardMembers[0]).signBudget()).to.emit;
      });
  
      it("Board members cannot sign more than once", async function () {
        const {deployedContract, owner, boardMembers} = await loadFixture(deployBudgetMultiSig)

          await deployedContract.connect(owner).proposeBudget(3000);
          await deployedContract.connect(boardMembers[0]).signBudget();
  
          await expect(deployedContract.connect(boardMembers[0]).signBudget()).to.be.reverted;
      });
    })

    describe("Deposit", () => {
      it("Owner should be able to deposit funds", async function () {
        const {deployedContract, owner} = await loadFixture(deployBudgetMultiSig)

          await expect(deployedContract.connect(owner).depositFunds({ value: ethers.parseEther("10") }))
              .to.changeEtherBalances([deployedContract], [ethers.parseEther("10")]);
      });
    })
});
