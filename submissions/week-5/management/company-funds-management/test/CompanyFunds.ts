import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { CompanyFunds } from "../typechain";

describe("CompanyFunds contract", function () {
  let companyFunds: CompanyFunds;
  let token: any;
  let boardMembers: string[];

  // Deploy contract fixture
  async function deployContract() {
    // Get signers (accounts)
    const [owner, signer1, signer2] = await ethers.getSigners();
    boardMembers = [owner.address, signer1.address, signer2.address];

    // Deploy a mock ERC20 token


    const Token = await ethers.getContractFactory("MyToken");
    token = await Token.deploy(ethers.parseEther("1000000000"));
    await token.deployed();

    // Deploy the CompanyFunds contract
    const CompanyFunds = await ethers.getContractFactory("CompanyFunds");
    companyFunds = await CompanyFunds.deploy(boardMembers, token.target);
    // await companyFunds.deployed();

    // Transfer some tokens to the CompanyFunds contract
    await token.transfer(companyFunds.target, ethers.parseUnits("500", 18));

    return { owner, signer1, signer2 };
  }

  it("should deploy the contract correctly", async function () {
    const { owner, signer1, signer2 } = await loadFixture(deployContract);
    const contractBalance = await companyFunds.getBalance();
    expect(contractBalance).to.equal(ethers.parseUnits("500", 18));
  });

  it("should allow board members to sign budget", async function () {
    const { owner, signer1, signer2 } = await loadFixture(deployContract);
    await companyFunds.connect(owner).signBudget();
    await companyFunds.connect(signer1).signBudget();
    await companyFunds.connect(signer2).signBudget();

    // Verify the signatures
    expect(await companyFunds.signatures(boardMembers[0])).to.be.true;
    expect(await companyFunds.signatures(boardMembers[1])).to.be.true;
    expect(await companyFunds.signatures(boardMembers[2])).to.be.true;

    expect(await companyFunds.totalSignatures()).to.equal(3);
  });

  it("should require all signatures before releasing funds", async function () {
    const { owner, signer1, signer2 } = await loadFixture(deployContract);
    // Only 2 signatures from 3 members
    await companyFunds.connect(owner).signBudget();
    await companyFunds.connect(signer1).signBudget();

    await expect(
      companyFunds.connect(owner).releaseFunds(boardMembers[0], ethers.parseUnits("100", 18))
    ).to.be.revertedWith("All signatures not present");

    // Add the third signature
    await companyFunds.connect(signer2).signBudget();

    await expect(
      companyFunds.connect(owner).releaseFunds(boardMembers[0], ethers.parseUnits("100", 18))
    ).to.not.be.reverted;
  });

  it("should release funds when all signatures are provided", async function () {
    const { owner, signer1, signer2 } = await loadFixture(deployContract);
    // All three signatures
    await companyFunds.connect(owner).signBudget();
    await companyFunds.connect(signer1).signBudget();
    await companyFunds.connect(signer2).signBudget();

    // Release funds to one of the board members
    const recipient = boardMembers[0];
    const amount = ethers.parseUnits("100", 18);

    await expect(() =>
      companyFunds.connect(owner).releaseFunds(recipient, amount)
    ).to.changeTokenBalance(token, recipient, amount);

    const contractBalance = await companyFunds.getBalance();
    expect(contractBalance).to.equal(ethers.parseUnits("400", 18)); // 500 - 100 = 400
  });

  it("should reset signatures after releasing funds", async function () {
    const { owner, signer1, signer2 } = await loadFixture(deployContract);
    // All three signatures
    await companyFunds.connect(owner).signBudget();
    await companyFunds.connect(signer1).signBudget();
    await companyFunds.connect(signer2).signBudget();

    // Release funds
    const recipient = boardMembers[0];
    await companyFunds.connect(owner).releaseFunds(recipient, ethers.parseUnits("100", 18));

    // Check if all signatures are reset
    expect(await companyFunds.signatures(boardMembers[0])).to.be.false;
    expect(await companyFunds.signatures(boardMembers[1])).to.be.false;
    expect(await companyFunds.signatures(boardMembers[2])).to.be.false;
    expect(await companyFunds.totalSignatures()).to.equal(0);
  });
});