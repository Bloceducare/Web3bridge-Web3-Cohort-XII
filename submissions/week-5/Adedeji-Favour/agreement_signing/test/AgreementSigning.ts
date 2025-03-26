import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("Agreement Signing", () => {
  async function deployAgreement() {
    const token = "0x0961AAFABCFDF7d5F9BA420702eAb7fF9C44ef76"
    const tokenContractFactory = await hre.ethers.getContractFactory("Token")
    const deployedToken = await tokenContractFactory.deploy("1000000000")

    const agreementContractFactory = await hre.ethers.getContractFactory("AgreementSigning")
    const deployedContract = await agreementContractFactory.deploy(deployedToken.target)
    const AGREEMENT_PRICE = hre.ethers.parseEther("10");
    const DEADLINE = Math.floor(Date.now() / 1000) + 86400;
    const [buyer, seller] = await hre.ethers.getSigners()

    return { deployedContract, deployedToken, buyer, seller, AGREEMENT_PRICE, DEADLINE }
  }

  describe("Deployment", () => {
    it("should test the deployer", async () => {
      const {deployedContract, buyer} = await loadFixture(deployAgreement)

      const deployer = deployedContract.runner

      expect(deployer).to.equal(buyer)
    })
  })

  describe("Create Signing", () => {
    it("should be able to create signing", async () => {
      const {deployedContract, buyer, seller, AGREEMENT_PRICE, DEADLINE} = await loadFixture(deployAgreement)

      await deployedContract.connect(buyer).createAgreement(seller, "name", "description", AGREEMENT_PRICE, DEADLINE)
      
      expect(await deployedContract.agreementId()).to.equal(1)
    })
  })
  
  describe("Sign Agreement", () => {
    it("should be able to sign agreement", async () => {
      const {deployedContract, seller, buyer, AGREEMENT_PRICE, DEADLINE} = await loadFixture(deployAgreement)

      await deployedContract.connect(buyer).createAgreement(seller, "name", "description", AGREEMENT_PRICE, DEADLINE)
      
      await deployedContract.connect(seller).signAgreement(buyer, 1)

      expect(await deployedContract.signedAgreement(seller, 1)).to.equal(true)
    })
  })
})
