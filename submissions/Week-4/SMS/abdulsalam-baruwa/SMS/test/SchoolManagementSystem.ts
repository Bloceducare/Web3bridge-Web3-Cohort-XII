import {
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import hre from "hardhat";

describe('SchoolManagementSystem', () => {
    const deploySchoolManagementSystem = async () => {
        const [owner, address1, address2] = await hre.ethers.getSigners()

        const SchoolManagementSystem = await hre.ethers.getContractFactory("SchoolManagementSystem")

        const deploySms = await SchoolManagementSystem.deploy()

        return { owner, deploySms, address1, address2 }
    }

    describe('Deployment', async () => {
        it('should be deployed by owner', async () => {
            const {owner, deploySms} = await loadFixture(deploySchoolManagementSystem)
            const runner = deploySms.runner as HardhatEthersSigner;
            expect(owner.address).to.equal(runner.address)
        })
    })
})