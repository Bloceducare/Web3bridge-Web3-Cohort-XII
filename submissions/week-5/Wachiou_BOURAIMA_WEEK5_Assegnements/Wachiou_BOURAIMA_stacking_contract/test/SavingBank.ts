import { expect } from "chai"
import hre from "hardhat"
import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { HardhatEthersHelpers } from "hardhat/types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";



describe("SavingBank", function () {
  const SavingBankFixture = async () => {

    const [manager, contributor1, contributor2] = await hre.ethers.getSigners();


    const Token = await hre.ethers.getContractFactory("MyERC20");
    const MyToken = await Token.deploy("Token", "TK", 1000000);

    const SavingBank = await hre.ethers.getContractFactory("SavingBank");
    const savingBank = await SavingBank.deploy(MyToken);


    return { MyToken, savingBank, manager, contributor1, contributor2 };
  };

  describe("Contract Deployment", function () {
    it("should deploy the contract with the owner as deployer", async function () {
      const { savingBank, manager, contributor1 } = await loadFixture(SavingBankFixture);
      const runner = (await savingBank).runner as HardhatEthersSigner;
      expect(runner.address).to.equal(manager.address);
    });
  });





  describe("Deposit ERC20", () => {
    it("should allow users to deposit ERC20 tokens", async () => {
      const { savingBank, MyToken, manager, contributor1 } = await loadFixture(SavingBankFixture);

      await MyToken.connect(manager).mint(contributor1.address, 1000);
      await MyToken.connect(contributor1).approve(savingBank.target, 500);
      await savingBank.connect(contributor1).deposit(500);

    });


    describe("withdrawal", () => {

      it("it should raise an error: TARGET WithdrawNotAllowed", async () => {
        const { savingBank, MyToken, manager, contributor1 } = await loadFixture(SavingBankFixture);

        await MyToken.connect(manager).mint(contributor1.address, 1000);
        await MyToken.connect(contributor1).approve(savingBank.target, 500);
        await savingBank.connect(contributor1).deposit(500);
        console.log(contributor1.address);
        await expect(savingBank.connect(contributor1).withdraw(500)).to.be.revertedWithCustomError(savingBank, "WithdrawNotAllowed");
      });


    })

  });
});