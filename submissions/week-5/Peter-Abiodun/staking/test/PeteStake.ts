import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { parseUnits } from "ethers";

describe("PeteStake Contract", () => {
  const deployContracts = async () => {
    const [owner, user] = await ethers.getSigners();

    // Deploy mock PeteToken contract
    const PeteToken = await ethers.getContractFactory("PeteToken");
    const peteToken = await PeteToken.deploy(parseUnits('10000'));
    await peteToken.waitForDeployment();

    // Mint tokens to owner and user
    await peteToken.mint(owner.address, ethers.parseUnits("1000"));
    await peteToken.mint(user.address, ethers.parseUnits("100"));
    
    // Deploy PeteStake contract
    const PeteStake = await ethers.getContractFactory("PeteStake");
    const peteStake = await PeteStake.deploy(peteToken.target, 7, 10);
    await peteStake.waitForDeployment();
    await peteToken.mint(peteStake.target, ethers.parseUnits("10000"));

    // Approve PeteStake contract to transfer tokens
    await peteToken.approve(peteStake.target, ethers.parseUnits("10000"));
    await peteToken.connect(user).approve(peteStake.target, ethers.parseUnits("1000"));

    

    const initialContractBalance = ethers.parseUnits("1000"); // Adjust as needed
    await peteToken.transfer(peteStake.target, initialContractBalance);

    return { peteStake, peteToken, owner, user };
  };

  describe("Staking", function () {
    it("Should allow a user to stake tokens", async function () {
      const { peteStake, peteToken, owner } = await loadFixture(deployContracts);
      
      await peteStake.stake(ethers.parseUnits("50"));
      const stake = await peteStake.stakes(owner.address);
      expect(stake.amount).to.equal(ethers.parseUnits("50"));
      expect(stake.active).to.be.true;
    });
  });

  describe("Rewards", function () {
    it("Should calculate rewards correctly", async function () {
      const { peteStake, peteToken, owner } = await loadFixture(deployContracts);
      
      await peteStake.stake(ethers.parseUnits("100"));
      await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]); // Increase time by 7 days
      await ethers.provider.send("evm_mine");

      const reward = await peteStake.calculateReward(owner.address);
      expect(reward).to.be.greaterThan(0);
    });
  });

  describe("Withdrawal", function () {
    it("Should allow users to withdraw after staking period", async function () {
      const { peteStake, peteToken, owner, user } = await loadFixture(deployContracts);
      
      await peteStake.connect(user).stake(ethers.parseUnits("10"));
      await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]); // Increase time by 7 days
      await ethers.provider.send("evm_mine");
      
      
    //   await peteToken.approve(peteStake.target, ethers.parseUnits("10000"));
      await peteStake.connect(user).withdraw();
      const stake = await peteStake.stakes(user.address);
      expect(stake.amount).to.equal(0);
      expect(stake.active).to.be.false;
    });
  });
});
