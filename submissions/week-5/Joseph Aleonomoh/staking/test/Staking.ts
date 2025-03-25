import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
  import { expect } from "chai";
  import hre from "hardhat";
  
  
  describe("StakingContract", () => {
      async function deployStakingContractFixture() {
          const [owner, address1, address2] = await hre.ethers.getSigners();
  
          const stakingContract = await hre.ethers.getContractFactory("Staking");
          const _stake = await stakingContract.deploy(2);
  
          return { _stake, owner, address1, address2 };
      }

      describe("Deployment", () => {
        it("should deploy the contract", async () => {
            const { _stake } = await loadFixture(deployStakingContractFixture);
            expect(await _stake.roi()).to.equal(2);

        });
        it("should deploy ERC20 Contract and store instance", async() => {
            const { _stake } = await loadFixture(deployStakingContractFixture);
            const token = 
            expect(await _stake.roi()).to.equal(2);
        })
      })
    });