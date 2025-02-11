const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

// Helper function to deploy contracts
async function deployContracts() {
  // Deploy ourToken Contract
  const OurToken = await ethers.getContractFactory("ourToken");
  const ourToken = await OurToken.deploy("OurToken", "OTK"); // Name and Symbol
  await ourToken.waitForDeployment(); // Ensure the contract is fully deployed

  // Get Signers
  const [owner, user1, user2] = await ethers.getSigners();

  return { ourToken, owner, user1, user2 };
}

describe("ourToken", function () {
  describe("Deployment", function () {
    it("should set the correct name and symbol", async function () {
      const { ourToken } = await loadFixture(deployContracts);
      expect(await ourToken.name()).to.equal("OurToken");
      expect(await ourToken.symbol()).to.equal("OTK");
    });

    it("should mint 1 million tokens to the owner during deployment", async function () {
      const { ourToken, owner } = await loadFixture(deployContracts);

      const totalSupply = await ourToken.totalSupply();
      const ownerBalance = await ourToken.balanceOf(owner.address);

      expect(totalSupply).to.equal(
        ethers.parseUnits("1000000", await ourToken.decimals())
      );
      expect(ownerBalance).to.equal(
        ethers.parseUnits("1000000", await ourToken.decimals())
      );
    });
  });

  describe("Transfers", function () {
    it("should allow the owner to transfer tokens to another address", async function () {
      const { ourToken, owner, user1 } = await loadFixture(deployContracts);

      const transferAmount = ethers.parseUnits(
        "100",
        await ourToken.decimals()
      );
      await ourToken.connect(owner).transfer(user1.address, transferAmount);

      const user1Balance = await ourToken.balanceOf(user1.address);
      expect(user1Balance).to.equal(transferAmount);
    });
    it("should reject transfers if the sender does not have enough balance", async function () {
      const { ourToken, user1, user2 } = await loadFixture(deployContracts);

      const transferAmount = ethers.parseUnits(
        "100",
        await ourToken.decimals()
      );
      await expect(
        ourToken.connect(user1).transfer(user2.address, transferAmount)
      ).to.be.revertedWithCustomError(ourToken, "ERC20InsufficientBalance");
    });
  });

  describe("Approvals", function () {
    it("should allow an address to approve another address to spend tokens on its behalf", async function () {
      const { ourToken, owner, user1 } = await loadFixture(deployContracts);

      const approveAmount = ethers.parseUnits("500", await ourToken.decimals());
      await ourToken.connect(owner).approve(user1.address, approveAmount);

      const allowance = await ourToken.allowance(owner.address, user1.address);
      expect(allowance).to.equal(approveAmount);
    });

    it("should allow approved tokens to be transferred by the spender", async function () {
      const { ourToken, owner, user1, user2 } = await loadFixture(
        deployContracts
      );

      const approveAmount = ethers.parseUnits("500", await ourToken.decimals());
      await ourToken.connect(owner).approve(user1.address, approveAmount);

      const transferAmount = ethers.parseUnits(
        "300",
        await ourToken.decimals()
      );
      await ourToken
        .connect(user1)
        .transferFrom(owner.address, user2.address, transferAmount);

      const user2Balance = await ourToken.balanceOf(user2.address);
      expect(user2Balance).to.equal(transferAmount);

      const remainingAllowance = (
        await ourToken.allowance(owner.address, user1.address)
      ).toString();
      expect(remainingAllowance).to.equal(
        (approveAmount - transferAmount).toString()
      );
    });

    it("should reject transfers exceeding the approved amount", async function () {
      const { ourToken, owner, user1, user2 } = await loadFixture(
        deployContracts
      );

      const approveAmount = ethers.parseUnits("500", await ourToken.decimals());
      await ourToken.connect(owner).approve(user1.address, approveAmount);

      const invalidTransferAmount = ethers.parseUnits(
        "600",
        await ourToken.decimals()
      );
      await expect(
        ourToken
          .connect(user1)
          .transferFrom(owner.address, user2.address, invalidTransferAmount)
      ).to.be.revertedWithCustomError(ourToken, "ERC20InsufficientAllowance");
    });
  });

  describe("Decimals", function () {
    it("should have 18 decimals by default (from ERC20)", async function () {
      const { ourToken } = await loadFixture(deployContracts);
      expect(await ourToken.decimals()).to.equal(18);
    });
  });

  describe("Total Supply", function () {
    it("should have a total supply of 1 million tokens after deployment", async function () {
      const { ourToken } = await loadFixture(deployContracts);
      const totalSupply = await ourToken.totalSupply();
      expect(totalSupply).to.equal(
        ethers.parseUnits("1000000", await ourToken.decimals())
      );
    });
  });
});
