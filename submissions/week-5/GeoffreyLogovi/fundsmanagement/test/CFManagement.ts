import { token } from "../typechain-types/@openzeppelin/contracts";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { time, loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre, { ethers } from "hardhat";

describe("CFManagement", function () {
  
  async function deployFundManager() {

    const [manager, member] = await hre.ethers.getSigners();

    const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'

    const Token = await hre.ethers.getContractFactory("IntERC20");
    const token = await Token.deploy("Token", "JAY", 1800000000000); 

    const FundManager = await hre.ethers.getContractFactory("CFManagement");
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

      await fundManager.moov(member.address, 1);

      let balanceAfter = await token.balanceOf(fundManager.target);

      expect(balanceAfter).to.be.greaterThan(balanceBefore);
    });
  });

  describe("Budgeting", function () {
    it("Should set the budget of the month", async function () {
      const {fundManager, manager} = await loadFixture(deployFundManager);

      let countBefore = await fundManager.monthsCount();

      await fundManager.connect(manager).budgeting(8123456789, 350000);

      let countAfter = await fundManager.monthsCount();

      expect(countAfter).to.be.greaterThan(countBefore);
    })
  });

  describe("Add Board members", function () {
    it("Should add board memebers", async function () {
      const {fundManager, manager, member} = await loadFixture(deployFundManager);

      let countBefore = await fundManager.boardCount();

      await fundManager.connect(manager).pushBoard(member.address);

      let countAfter = await fundManager.boardCount();

      expect(countAfter).to.be.greaterThan(countBefore);
    })
  })

});
