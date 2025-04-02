import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import hre from "hardhat";
import { expect } from "chai";

describe("PiggyBankErc20", function () {
  async function deployPiggyBankContract() {

    let ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

    const [owner, tokenHolder, contributors] = await hre.ethers.getSigners();
    // const Token = await hre.ethers.getContractFactory("MyERC20Token"); // for testing with MyERC20Token

    // for testing with ERC20 using OpenZeppelin
    const Token = await hre.ethers.getContractFactory("MockERC20");
    const token = await Token.deploy();


    const PiggyBankErc20 = await hre.ethers.getContractFactory("PiggyBankErc20");
    const targetAmount = hre.ethers.parseEther("1");
    const latestTime = await time.latest();
    const withdrawalDate = (latestTime + 3600);

    const deployedPiggyBank = await PiggyBankErc20.deploy(
      targetAmount,
      withdrawalDate,
      token.target, // address of the token
      owner.address, // address of the owner
      contributors
    );

    return { deployedPiggyBank, token, owner, tokenHolder, ADDRESS_ZERO, contributors };
  }

  describe("Deployment", function () {
    it("Should deploy PiggyBankErc20", async function () {
      const { deployedPiggyBank, owner } = await loadFixture(deployPiggyBankContract);
      const runner = deployedPiggyBank.runner as HardhatEthersSigner;

      expect(runner.address).to.equal(owner.address);    });
  });

  describe('Deposit', function () {
    it('should accept contributions', async function () {
        const { deployedPiggyBank, token, tokenHolder, contributors } = await loadFixture(deployPiggyBankContract);

        const contributionBefore = await token.balanceOf(deployedPiggyBank.address);

        const contribution = hre.ethers.parseEther("1");

        await token.transfer(contributors.address, contribution); 
        await token.connect(contributors).approve(deployedPiggyBank.address, contribution); 
        // console.log("Token Address:", token.target); // <-- Add this line
        await deployedPiggyBank.connect(contributors).deposit(contribution, { value: 0 });
       

        const contributionAfter = await token.balanceOf(deployedPiggyBank.address);

        // console.log("contributionBefore: ", contributionBefore.toString());
        // console.log("contributionAfter: ", contributionAfter.toString());

        // expect(contributionAfter).to.be.greaterThanOrEqual(contributionBefore);
    });
});
});
