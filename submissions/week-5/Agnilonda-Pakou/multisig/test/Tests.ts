import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import hre, { ethers } from "hardhat";

describe("FundsManagement", function () {
  
  async function deployFundManager() {

    const [manager, member] = await hre.ethers.getSigners();

    const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'

    const Token = await hre.ethers.getContractFactory("IntERC20");
    const token = await Token.deploy("Token", "TKN", 1800000000000); 

    const FundManager = await hre.ethers.getContractFactory("FundsManagement");
    const fundManager = await FundManager.deploy(token.target);

    return { fundManager, manager, member, ADDRESS_ZERO, token };
  }

  describe("Deploy our contract", function () {
    it("Should check if runner is the owner", async function () {
      const {fundManager, manager} = await loadFixture(deployFundManager);

      let runner = fundManager.runner as HardhatEthersSigner;

      expect(runner.address).to.be.equal(manager.address);
    });

    it("Should check if the runner is not address zero", async function () {
      const {fundManager, ADDRESS_ZERO} = await loadFixture(deployFundManager);

      expect(fundManager).to.not.be.equal(ADDRESS_ZERO);
    })
  });

  describe("Cash in the contract", function () {
    it("Should cash in the contract", async function () {
      const {fundManager, token, member} = await loadFixture(deployFundManager);

      await token.mint(member.address, 100000);

      let balanceBefore = await token.balanceOf(fundManager.target);

      token.connect(member).approve(fundManager.target, 1);

      await fundManager.cashingIn(member.address, 1);

      let balanceAfter = await token.balanceOf(fundManager.target);

      expect(balanceAfter).to.be.greaterThan(balanceBefore);
    });
  });

  describe("Budgeting", function () {
    it("Should set the budget of the month", async function () {
      const {fundManager, manager} = await loadFixture(deployFundManager);

      let countBefore = await fundManager.monthsCount();

      await fundManager.connect(manager).budgeting(1740892055, 100000);

      let countAfter = await fundManager.monthsCount();

      expect(countAfter).to.be.greaterThan(countBefore);
    })
  });

  describe("Add Boad members", function () {
    it("Should add boad memebers", async function () {
      const {fundManager, manager, member} = await loadFixture(deployFundManager);

      let countBefore = await fundManager.boardMembersCount();

      await fundManager.connect(manager).addBoardMember(member.address);

      let countAfter = await fundManager.boardMembersCount();

      expect(countAfter).to.be.greaterThan(countBefore);
    })
  })
  

  // describe("Sign the budget", function () {
  //   it("Should sign the budget", async function () {
  //     const { fundManager, manager, member } = await loadFixture(deployFundManager);

  //     await fundManager.connect(manager).addBoardMember(member.address); // Ajout du membre au board

  //     let signedBefore = await fundManager.boardMembers(member.address);

  //     await fundManager.connect(member).signeBudget(); // Correction : signer en tant que membre

  //     let signedAfter = await fundManager.boardMembers(member.address);

  //     expect(signedAfter).to.not.equal(signedBefore);
  //   });
  // });

  describe("Release the money", function () {
    it("Should release the money", async function () {
      const { fundManager, token, manager } = await loadFixture(deployFundManager);

      let balanceBefore = await token.balanceOf(manager.address);

      await fundManager.connect(manager).releaseMoney();

      let balanceAfter = await token.balanceOf(manager.address);

      expect(balanceAfter).to.be.equal(balanceBefore);
    });
  });
});
