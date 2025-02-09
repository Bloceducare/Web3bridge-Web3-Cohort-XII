import { expect } from "chai";
import { ethers } from "hardhat";
import { OurERC20 } from "../typechain-types";

describe("OurERC20 Token", function () {
  let token: OurERC20;
  let owner: any;
  let addr1: any;
  let addr2: any;
  let initialSupply: bigint;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy OurERC20 token
    const Token = await ethers.getContractFactory("OurERC20");
    token = await Token.deploy("OurToken", "OTK");
    await token.waitForDeployment();

    initialSupply = await token.balanceOf(owner.address);
  });

  it("Should deploy with correct name and symbol", async function () {
    expect(await token.name()).to.equal("OurToken");
    expect(await token.symbol()).to.equal("OTK");
  });

  it("Should assign initial supply to owner", async function () {
    expect(await token.balanceOf(owner.address)).to.equal(initialSupply);
  });

  it("Should allow token transfers", async function () {
    const transferAmount = ethers.parseEther("1");

    await token.transfer(addr1.address, transferAmount);

    expect(await token.balanceOf(addr1.address)).to.equal(transferAmount);
    expect(await token.balanceOf(owner.address)).to.equal(initialSupply - transferAmount);
  });

  it("Should not allow transfer more than balance", async function () {
    const largeAmount = initialSupply + ethers.parseEther("1");
    await expect(token.transfer(addr1.address, largeAmount)).to.be.reverted;
  });

  it("Should allow transferFrom when approved", async function () {
    const transferAmount = ethers.parseEther("1");

    await token.approve(addr1.address, transferAmount);
    await token.connect(addr1).transferFrom(owner.address, addr2.address, transferAmount);

    expect(await token.balanceOf(addr2.address)).to.equal(transferAmount);
  });

  it("Should fail transferFrom without approval", async function () {
    const transferAmount = ethers.parseEther("1");

    await expect(token.connect(addr1).transferFrom(owner.address, addr2.address, transferAmount)).to.be.reverted;
  });
});
