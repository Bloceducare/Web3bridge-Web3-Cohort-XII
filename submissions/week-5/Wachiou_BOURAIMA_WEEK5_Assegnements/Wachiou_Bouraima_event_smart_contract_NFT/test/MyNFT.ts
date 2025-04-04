import { expect } from "chai";
import hre from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("MyNFT", function () {
  async function deployMyNFTFixture() {
    const name = "MyNFT";
    const symbol = "MNFT";
    const totalSupply = 10;
    const MyNFT = await hre.ethers.getContractFactory("MyNFT");
    const [owner, minter, user1, user2] = await hre.ethers.getSigners();
    const myNFT = await MyNFT.deploy(name, symbol, totalSupply, "");

    return { myNFT, owner, minter, user1, user2, totalSupply };
  }

  describe("Deployment", function () {
    it("Should set the right name and symbol", async function () {
      const { myNFT } = await loadFixture(deployMyNFTFixture);
      expect(await myNFT.name()).to.equal("MyNFT");
      expect(await myNFT.symbol()).to.equal("MNFT");
    });
  });

  describe("Minting", function () {
    it("Should allow the minter to mint a token", async function () {
      const { myNFT, owner, user1 } = await loadFixture(deployMyNFTFixture);
      await myNFT.mint(user1.address);
      expect(await myNFT.balanceOf(user1.address)).to.equal(1);
    });

    it("Should not allow minting beyond total supply", async function () {
      const { myNFT, owner, user1 } = await loadFixture(deployMyNFTFixture);
      for (let i = 0; i < 10; i++) {
        await myNFT.mint(user1.address);
      }
      await expect(myNFT.mint(user1.address)).to.be.revertedWith("MAX SUPPLY REACHED");
    });
  });

  describe("Transfers", function () {
    it("Should allow transfer of a token", async function () {
      const { myNFT, user1, user2 } = await loadFixture(deployMyNFTFixture);
      await myNFT.mint(user1.address);
      await myNFT.connect(user1).transferFrom(user1.address, user2.address, 0);
      expect(await myNFT.balanceOf(user2.address)).to.equal(1);
      expect(await myNFT.balanceOf(user1.address)).to.equal(0);
    });

    it("Should not allow unauthorized transfer", async function () {
      const { myNFT, user1, user2 } = await loadFixture(deployMyNFTFixture);
      await myNFT.mint(user1.address);
      await expect(myNFT.connect(user2).transferFrom(user1.address, user2.address, 0)).to.be.revertedWith("NOT APPROVED");
    });
  });
});

