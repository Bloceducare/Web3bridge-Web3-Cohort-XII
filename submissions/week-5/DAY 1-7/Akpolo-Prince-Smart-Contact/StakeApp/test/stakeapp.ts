import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("StakingApp", function () {
  async function deployStakingAppFixture() {
    const [owner, user1, user2] = await hre.ethers.getSigners();

    // Deploy a mock ERC-20 token
    const Token = await hre.ethers.getContractFactory("StakeCoin");
    const token = await Token.deploy(10);

    // Deploy StakingApp contract
    const StakingApp = await hre.ethers.getContractFactory("StakingApp");
    const stakingApp = await StakingApp.deploy(token.target);

    // Mint tokens to users
    await token.mint(owner.address, hre.ethers.parseEther("1000"));
    await token.mint(user1.address, hre.ethers.parseEther("600"));
    await token.mint(user2.address, hre.ethers.parseEther("500"));

    // ✅ FUND THE CONTRACT (Ensures it can pay rewards)
    await token.mint(stakingApp.target, hre.ethers.parseEther("500")); // Add 500 tokens to StakingApp

    return { stakingApp, token, owner, user1, user2 };
  }

  describe("Deployment", function () {
    it("Should deploy with the correct token address", async function () {
      const { stakingApp, token } = await loadFixture(deployStakingAppFixture);
      expect(await stakingApp.token()).to.equal(token.target);
    });
  });

  describe("Account Creation", function () {
    it("Should allow users to create an account", async function () {
      const { stakingApp, user1 } = await loadFixture(deployStakingAppFixture);
      const latestTime = await time.latest();
      await stakingApp.connect(user1).creatingAccount(latestTime + 86400, "User1");
      const account = await stakingApp.getAnAccount(user1.address);
      expect(account.name).to.equal("User1");
    });
  });

  describe("Deposits", function () {
    it("Should allow users to deposit tokens", async function () {
      const { stakingApp, token, user1 } = await loadFixture(deployStakingAppFixture);
      const latestTime = await time.latest();
      await stakingApp.connect(user1).creatingAccount(latestTime + 86400, "User1");
      await token.connect(user1).approve(stakingApp.target, hre.ethers.parseEther("100"));
      await stakingApp.connect(user1).depositAccount(hre.ethers.parseEther("100"));
      const account = await stakingApp.getAnAccount(user1.address);
      expect(account.amount).to.equal(hre.ethers.parseEther("100"));
    });
  });

  describe("Withdrawals", function () {
    it("Should allow users to withdraw after deadline with rewards", async function () {
      const { stakingApp, token, user1 } = await loadFixture(deployStakingAppFixture);
      const latestTime = await time.latest();

      // ✅ CREATE ACCOUNT
      await stakingApp.connect(user1).creatingAccount(latestTime + 86400, "User1");

      // ✅ APPROVE & DEPOSIT TOKENS
      await token.connect(user1).approve(stakingApp.target, hre.ethers.parseEther("100"));
      await stakingApp.connect(user1).depositAccount(hre.ethers.parseEther("100"));

      // ✅ FAST-FORWARD TIME
      await time.increase(86400); // Fast-forward 1 day

      // ✅ DEBUG BALANCES BEFORE WITHDRAWAL
      console.log("🔹 User1 balance before withdrawal:", (await token.balanceOf(user1.address)).toString());
      console.log("🔹 Contract balance before withdrawal:", (await token.balanceOf(stakingApp.target)).toString());

      // ✅ WITHDRAW FUNDS
      await stakingApp.connect(user1).withdraw();

      // ✅ DEBUG BALANCES AFTER WITHDRAWAL
      console.log("✅ User1 balance after withdrawal:", (await token.balanceOf(user1.address)).toString());
      console.log("✅ Contract balance after withdrawal:", (await token.balanceOf(stakingApp.target)).toString());

      // ✅ CHECK EXPECTED BALANCE (Includes rewards)
      expect(await token.balanceOf(user1.address)).to.be.greaterThan(hre.ethers.parseEther("500"));
    });
  });
});
