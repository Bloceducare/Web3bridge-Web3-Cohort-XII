import { time, loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";

describe ("StakingContractTest", function (){
  async function deployedStakingContract(){
    const [owner, account1, account2] = await ethers.getSigners();

    const StakingContract = await ethers.getContractFactory("Stake");
    _stakingToken = 
    _rewardToken = 
    _rewardToken =
    const deployStake = await StakingContract.deploy(owner.address);

    await deployStake.waitForDeployment(); 

    return { deployStake, owner, account1, account2 };
  }
})