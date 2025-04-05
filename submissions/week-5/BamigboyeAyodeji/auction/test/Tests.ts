
import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { assert } from "console";
import hre, { ethers } from "hardhat";
import { expect } from "chai";

describe('Staking contract test', () => {

  const piggyBankContract = async () => {

      const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'

      const [owner] = await hre.ethers.getSigners();

      const skaking = await hre.ethers.getContractFactory("StackingContract");

      const deployStaking = await skaking.deploy(owner.address);

      return {deployStaking, owner, ADDRESS_ZERO}
  }

  describe('Deploy Staking contract', () => {
      it('Should deploy piggy bank smart contract by manager', async () => {
          let {deployStaking, owner} = await loadFixture(piggyBankContract);

          const runner = deployStaking.runner as HardhatEthersSigner;

          expect(runner.address).to.be.equal(owner.address);
      })

      it('Should not be address zero', async () => {
          let {deployStaking, ADDRESS_ZERO} = await loadFixture(piggyBankContract);

          expect(deployStaking.target).to.not.be.equal(ADDRESS_ZERO);
      })
  })

  describe('Withdraw money', () => {
      it('Should check if the runner is the manager', async () => {
          let {deployStaking, owner} = await loadFixture(piggyBankContract);

          const runner = deployStaking.runner as HardhatEthersSigner;

          expect(runner.address).to.be.equal(owner.address);
      })
  })
})