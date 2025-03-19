import { expect } from "chai";
import hre from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("Piggy Contract", function () {
  async function deployPiggyContract() {
    const [owner, user] = await hre.ethers.getSigners();
    const Piggy = await hre.ethers.getContractFactory("Piggy");
    const piggy = await Piggy.deploy();

    return { piggy, owner, user };
  }

  describe("Deployment", function () {
    it("Should deploy successfully and set the correct owner", async function () {
      const { piggy, owner } = await loadFixture(deployPiggyContract);
      expect(await piggy.owner()).to.equal(owner.address);
    });
  });

  describe("Deposits", function () {
    it("Should allow owner to deposit funds", async function () {
      const { piggy, owner } = await loadFixture(deployPiggyContract);

      await piggy.connect(owner).depositFund(hre.ethers.parseEther("1"), {
        value: hre.ethers.parseEther("1"),
      });

      expect(await piggy.fundInDeposit()).to.equal(hre.ethers.parseEther("1"));
    });

    it("Should not allow non-owners to deposit funds", async function () {
      const { piggy, user } = await loadFixture(deployPiggyContract);
      await expect(
        piggy.connect(user).depositFund(hre.ethers.parseEther("1"), {
          value: hre.ethers.parseEther("1"),
        })
      ).to.be.revertedWith("Only owner authorized to save");
    });
  });

  describe("Withdrawals", function () {
    it("Should allow owner to withdraw funds", async function () {
      const { piggy, owner } = await loadFixture(deployPiggyContract);

      await piggy.connect(owner).depositFund(hre.ethers.parseEther("1"), {
        value: hre.ethers.parseEther("1"),
      });

      await piggy.connect(owner).withdraw(hre.ethers.parseEther("0.5"));

      expect(await piggy.fundInDeposit()).to.equal(hre.ethers.parseEther("0.5"));
    });

    it("Should not allow withdrawal of more than available funds", async function () {
      const { piggy, owner } = await loadFixture(deployPiggyContract);

      await piggy.connect(owner).depositFund(hre.ethers.parseEther("1"), {
        value: hre.ethers.parseEther("1"),
      });

      await expect(
        piggy.connect(owner).withdraw(hre.ethers.parseEther("2"))
      ).to.be.revertedWith("You don't have enough funds in your deposit");
    });
  });

  describe("Time-Based Actions", function () {
    it("Should allow owner to set action time", async function () {
      const { piggy, owner } = await loadFixture(deployPiggyContract);
      const duration = 3600; // 1 hour

      await piggy.connect(owner).setActionTime(duration);

      expect(await piggy.actionTime()).to.be.greaterThan(0);
    });
  });
});
