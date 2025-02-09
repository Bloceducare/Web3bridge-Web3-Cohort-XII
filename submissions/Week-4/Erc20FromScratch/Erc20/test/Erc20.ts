import { expect } from "chai";
import { ethers } from "hardhat";
import { CustomERC20 } from "../typechain-types";

describe("CustomERC20 Token", function () {
  let token: CustomERC20;
  let owner: any;
  let addr1: any;
  let addr2: any;
  let initialSupply: bigint;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy CustomERC20 token
    const Token = await ethers.getContractFactory("CustomERC20");
    token = await Token.deploy("CustomToken", "CTK", 18, 1000);
    await token.waitForDeployment();

    initialSupply = await token.balanceOf(owner.address);
  });

  it("Should deploy with correct name and symbol", async function () {
    expect(await token.name()).to.equal("CustomToken");
    expect(await token.symbol()).to.equal("CTK");
  });

  it("Should assign initial supply to owner", async function () {
    expect(await token.balanceOf(owner.address)).to.equal(initialSupply);
  });

  it("Should allow token transfers", async function () {
    const transferAmount = ethers.parseEther("10");

    await token.transfer(addr1.address, transferAmount);

    expect(await token.balanceOf(addr1.address)).to.equal(transferAmount);
    expect(await token.balanceOf(owner.address)).to.equal(initialSupply - transferAmount);
  });

  it("Should not allow transfer more than balance", async function () {
    const largeAmount = initialSupply + ethers.parseEther("1");
    await expect(token.transfer(addr1.address, largeAmount)).to.be.reverted;
  });

  it("Should allow transferFrom when approved", async function () {
    const transferAmount = ethers.parseEther("10");

    await token.approve(addr1.address, transferAmount);
    await token.connect(addr1).transferFrom(owner.address, addr2.address, transferAmount);

    expect(await token.balanceOf(addr2.address)).to.equal(transferAmount);
  });

  it("Should fail transferFrom without approval", async function () {
    const transferAmount = ethers.parseEther("10");

    await expect(token.connect(addr1).transferFrom(owner.address, addr2.address, transferAmount)).to.be.reverted;
  });

  it("Should allow increasing allowance", async function () {
    const increaseAmount = ethers.parseEther("5");
    await token.increaseAllowance(addr1.address, increaseAmount);
    expect(await token.allowance(owner.address, addr1.address)).to.equal(increaseAmount);
  });

  it("Should allow decreasing allowance", async function () {
    const increaseAmount = ethers.parseEther("5");
    await token.increaseAllowance(addr1.address, increaseAmount);
    await token.decreaseAllowance(addr1.address, ethers.parseEther("2"));
    expect(await token.allowance(owner.address, addr1.address)).to.equal(ethers.parseEther("3"));
  });

  it("Should allow minting tokens", async function () {
    const mintAmount = ethers.parseEther("20");
    await token.mint(addr1.address, mintAmount);
    expect(await token.balanceOf(addr1.address)).to.equal(mintAmount);
  });

  it("Should allow burning tokens", async function () {
    const burnAmount = ethers.parseEther("10");
    await token.burn(burnAmount);
    expect(await token.balanceOf(owner.address)).to.equal(initialSupply - burnAmount);
  });
});
