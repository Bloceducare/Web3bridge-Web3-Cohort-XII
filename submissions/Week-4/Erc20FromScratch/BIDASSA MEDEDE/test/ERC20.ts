import { expect } from "chai";
import { ethers } from "hardhat";

describe("ERC20Token", function () {
  async function deployTokenFixture() {
    const [owner, user1, user2] = await ethers.getSigners();
    
    const Token = await ethers.getContractFactory("ERC20Token");
    const token = await Token.deploy("MyToken", 1000000, 18, "MTK");

    return { token, owner, user1, user2 };
  }

  it("Should deploy with correct initial values", async function () {
    const { token, owner } = await deployTokenFixture();
    
    expect(await token.name()).to.equal("MyToken");
    expect(await token.symbol()).to.equal("MTK");
    expect(await token.totalSupply()).to.equal(ethers.parseUnits("1000000", 18));
    expect(await token._owner()).to.equal(owner.address);
  });

  it("Should allow transfer of tokens", async function () {
    const { token, owner, user1 } = await deployTokenFixture();
    
    await token.transfer(user1.address, 100);
    expect(await token.balanceOf(user1.address)).to.equal(100);
  });

  it("Should fail transfer if balance is insufficient", async function () {
    const { token, user1, user2 } = await deployTokenFixture();
    
    await expect(token.connect(user1).transfer(user2.address, 100)).to.be.revertedWith("YOUR BALANCE IS NOT ENOUGH");
  });

  it("Should approve an allowance for another account", async function () {
    const { token, owner, user1 } = await deployTokenFixture();
    
    await token.approve(user1.address, 500);
    expect(await token.allowance(owner.address, user1.address)).to.equal(500);
  });

  it("Should allow transferFrom with sufficient allowance", async function () {
    const { token, owner, user1, user2 } = await deployTokenFixture();
    
    await token.approve(user1.address, 300);
    await token.connect(user1).transferFrom(owner.address, user2.address, 300);
    
    expect(await token.balanceOf(user2.address)).to.equal(300);
    expect(await token.allowance(owner.address, user1.address)).to.equal(0);
  });

  it("Should fail transferFrom if allowance is insufficient", async function () {
    const { token, owner, user1, user2 } = await deployTokenFixture();
    
    await expect(token.connect(user1).transferFrom(owner.address, user2.address, 500)).to.be.revertedWith("INSUFFICIENT ALLOWANCE");
  });

  it("Should allow owner to mint tokens", async function () {
    const { token, owner, user1 } = await deployTokenFixture();
    
    await token._mint(user1.address, 1000);
    expect(await token.balanceOf(user1.address)).to.equal(1000);
  });

  it("Should fail mint if not owner", async function () {
    const { token, user1, user2 } = await deployTokenFixture();
    
    await expect(token.connect(user1)._mint(user2.address, 1000)).to.be.revertedWith("YOU ARE NOT THE OWNER");
  });

  it("Should allow owner to burn tokens", async function () {
    const { token, owner, user1 } = await deployTokenFixture();
    
    await token._mint(user1.address, 1000);
    await token._burn(user1.address, 500);
    
    expect(await token.balanceOf(user1.address)).to.equal(500);
    expect(await token.totalSupply()).to.equal(ethers.parseUnits("999500", 18));
  });

  it("Should fail burn if not owner", async function () {
    const { token, user1, user2 } = await deployTokenFixture();
    
    await token._mint(user1.address, 1000);
    await expect(token.connect(user1)._burn(user1.address, 500)).to.be.revertedWith("YOU ARE NOT THE OWNER");
  });
});
