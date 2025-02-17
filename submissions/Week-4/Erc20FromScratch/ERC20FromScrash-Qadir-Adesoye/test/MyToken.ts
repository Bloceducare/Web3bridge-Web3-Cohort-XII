import { expect } from "chai";
import { ethers } from "hardhat";
import { MyToken } from "../typechain-types";

describe("MyToken", function () {
  let myToken: MyToken;
  let owner: any, addr1: any, addr2: any;

  beforeEach(async function () {
    const MyToken = await ethers.getContractFactory("MyToken");
    [owner, addr1, addr2] = await ethers.getSigners();
    myToken = await MyToken.deploy("MyToken", "MTK", 18);
    await myToken.waitForDeployment(); // Use waitForDeployment() in Hardhat v3+
  });

  it("Should have correct name, symbol, and decimals", async function () {
    expect(await myToken.name()).to.equal("MyToken");
    expect(await myToken.symbol()).to.equal("MTK");
    expect(await myToken.decimals()).to.equal(18);
  });

  it("Should assign initial supply to owner", async function () {
    const ownerBalance = await myToken.balanceOf(owner.address);
    const expectedSupply = ethers.parseUnits("100", 18); // Convert 100 tokens to correct decimals
    expect(await myToken.totalSupply()).to.equal(expectedSupply);
    expect(ownerBalance).to.equal(expectedSupply);
  });

  it("Should allow owner to mint tokens", async function () {
    const mintAmount = ethers.parseUnits("50", 18);
    await myToken.mint(owner.address, mintAmount);
    const newBalance = await myToken.balanceOf(owner.address);
    expect(newBalance).to.equal(ethers.parseUnits("150", 18));
  });

  it("Should allow owner to burn tokens", async function () {
    const burnAmount = ethers.parseUnits("30", 18);
    await myToken.burn(owner.address, burnAmount);
    const newBalance = await myToken.balanceOf(owner.address);
    expect(newBalance).to.equal(ethers.parseUnits("70", 18));
  });

  it("Should transfer tokens between accounts", async function () {
    const transferAmount = ethers.parseUnits("10", 18);
    await myToken.transfer(addr1.address, transferAmount);
    expect(await myToken.balanceOf(addr1.address)).to.equal(transferAmount);
  });

  it("Should approve tokens for delegated transfer", async function () {
    const approveAmount = ethers.parseUnits("20", 18);
    await myToken.approve(addr1.address, approveAmount);
    expect(await myToken.allowance(owner.address, addr1.address)).to.equal(approveAmount);
  });

  it("Should handle transferFrom correctly", async function () {
    const approveAmount = ethers.parseUnits("15", 18);
    const transferAmount = ethers.parseUnits("10", 18);

    await myToken.approve(addr1.address, approveAmount);
    await myToken.connect(addr1).transferFrom(owner.address, addr2.address, transferAmount);

    expect(await myToken.balanceOf(addr2.address)).to.equal(transferAmount);
    expect(await myToken.allowance(owner.address, addr1.address)).to.equal(
      ethers.parseUnits("5", 18)
    );
  });
});
