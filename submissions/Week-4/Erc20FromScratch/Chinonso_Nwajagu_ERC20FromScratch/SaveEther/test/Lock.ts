import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";
import { ethers } from "ethers";
// import ethers from "hardhat"
// import parseUnits from "@nomicfoundation/hardhat-toolbox"

describe("SaveERC20", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployToken() {


    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const erc20Token = await hre.ethers.getContractFactory("Web3CXI");
    const token = await erc20Token.deploy();

    return { token, owner, otherAccount };
  }

  async function deploySaveERC20Token() {


    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const { token } = await loadFixture(deployToken);

    const saveERC20 = await hre.ethers.getContractFactory("SaveERC20");
    const saveErc20 = await saveERC20.deploy(token);
 
    return { saveErc20, owner, otherAccount, token };
  }


  describe("Deployment", function () {
    it("Should check if owner is correct", async function () {
      const { saveErc20, owner } = await loadFixture(deploySaveERC20Token);

      expect(await saveErc20.owner()).to.equal(owner);
    });

    it("Should check if tokenAddress is correct", async function () {
      const { saveErc20, owner, token } = await loadFixture(deploySaveERC20Token);

      expect(await saveErc20.tokenAddress()).to.equal(token);
    });

    // it("Should set the right owner", async function () {
    //   const { lock, owner } = await loadFixture(deployOneYearLockFixture);

    //   expect(await lock.owner()).to.equal(owner.address);
    // });

    // it("Should receive and store the funds to lock", async function () {
    //   const { lock, lockedAmount } = await loadFixture(
    //     deployOneYearLockFixture
    //   );

    //   expect(await hre.ethers.provider.getBalance(lock.target)).to.equal(
    //     lockedAmount
    //   );
    // });

    // it("Should fail if the unlockTime is not in the future", async function () {
    //   // We don't use the fixture here because we want a different deployment
    //   const latestTime = await time.latest();
    //   const Lock = await hre.ethers.getContractFactory("Lock");
    //   await expect(Lock.deploy(latestTime, { value: 1 })).to.be.revertedWith(
    //     "Unlock time should be in the future"
    //   );
    // });
  });

  describe("Deposit", function () {
    it("Should deposit successfully", async function () {

      const { saveErc20, owner, otherAccount, token } = await loadFixture(deploySaveERC20Token);

      const trfAmount = ethers.parseUnits("100", 18);
      await token.transfer(otherAccount, trfAmount);
      expect(await token.balanceOf(otherAccount)).to.equal(trfAmount);


      await token.connect(otherAccount).approve(saveErc20, trfAmount);

      const otherAccountBalBefore = await token.balanceOf(otherAccount);

      const depositAmount = ethers.parseUnits("10", 18);

      await saveErc20.connect(otherAccount).deposit(depositAmount);

      expect(await token.balanceOf(otherAccount)).to.equal(otherAccountBalBefore - depositAmount);
      //owner balance
      expect(await saveErc20.connect(otherAccount).myBalance()).to.equal(depositAmount);
      //contract balance
      expect(await saveErc20.getContractBalance()).to.equal(depositAmount);
        

    });

    it("Should emit an event after successful deposit", async function () {

      const { saveErc20, otherAccount, token } = await loadFixture(deploySaveERC20Token);

      const trfAmount = ethers.parseUnits("100", 18);
      await token.transfer(otherAccount, trfAmount);
  
      await token.connect(otherAccount).approve(saveErc20, trfAmount);

      const depositAmount = ethers.parseUnits("10", 18);
        
      await expect(saveErc20.connect(otherAccount).deposit(depositAmount))
        .to.emit(saveErc20, "DepositSuccessful")
        .withArgs(otherAccount.address, depositAmount);
    });

    it("Should revert on zero deposit", async function () {
      const { saveErc20, otherAccount, token } = await loadFixture(deploySaveERC20Token);

      // const trfAmount = ethers.parseUnits("100", 18);
      // await token.transfer(otherAccount, trfAmount);
  
      // await token.connect(otherAccount).approve(saveErc20, trfAmount);

      const depositAmount = ethers.parseUnits("0", 18);

      await expect(
        saveErc20.connect(otherAccount).deposit(depositAmount)
      ).to.be.revertedWithCustomError(saveErc20, "ZeroValueNotAllowed");
        
    });


  });

  describe("Withdrawal", function () {
    it("Should deposit successfully", async function () {

      const { saveErc20, owner, otherAccount, token } = await loadFixture(deploySaveERC20Token);

        //Transfer ERC20 token from owner to otherAccount
      const trfAmount = ethers.parseUnits("100", 18);
      await token.transfer(otherAccount, trfAmount);
      expect(await token.balanceOf(otherAccount)).to.equal(trfAmount);

      //otherAccount approve contract address to spend some tokens
      await token.connect(otherAccount).approve(saveErc20, trfAmount);

      const otherAccountBalBefore = await token.balanceOf(otherAccount);

      //otherAccount deposits into SaveERC20 contract
      const depositAmount = ethers.parseUnits("10", 18);

      await saveErc20.connect(otherAccount).deposit(depositAmount);

      expect(await token.balanceOf(otherAccount)).to.equal(otherAccountBalBefore - depositAmount);
      //owner balance
      expect(await saveErc20.connect(otherAccount).myBalance()).to.equal(depositAmount);
      //contract balance
      expect(await saveErc20.getContractBalance()).to.equal(depositAmount);

      //otherAccount withdraw from contract
      const initBalanceBeforeWithdrawal = await token.balanceOf(otherAccount);
      const withdrawAmount = ethers.parseUnits("5", 18);

      await saveErc20.connect(otherAccount).withdraw(withdrawAmount);

      const BalanceAfterWithdrawal = await token.balanceOf(otherAccount);

      expect(await saveErc20.getContractBalance()).to.equal(depositAmount - withdrawAmount);
      expect(await saveErc20.connect(otherAccount).myBalance()).to.equal(depositAmount - withdrawAmount);
      expect(await token.balanceOf(otherAccount)).to.equal(BalanceAfterWithdrawal);
        

    });

    // it("Should emit an event after successful deposit", async function () {

    //   const { saveErc20, otherAccount, token } = await loadFixture(deploySaveERC20Token);

    //   const trfAmount = ethers.parseUnits("100", 18);
    //   await token.transfer(otherAccount, trfAmount);
  
    //   await token.connect(otherAccount).approve(saveErc20, trfAmount);

    //   const depositAmount = ethers.parseUnits("10", 18);
        
    //   await expect(saveErc20.connect(otherAccount).deposit(depositAmount))
    //     .to.emit(saveErc20, "DepositSuccessful")
    //     .withArgs(otherAccount.address, depositAmount);
    // });

    // it("Should revert on zero deposit", async function () {
    //   const { saveErc20, otherAccount, token } = await loadFixture(deploySaveERC20Token);

    //   // const trfAmount = ethers.parseUnits("100", 18);
    //   // await token.transfer(otherAccount, trfAmount);
  
    //   // await token.connect(otherAccount).approve(saveErc20, trfAmount);

    //   const depositAmount = ethers.parseUnits("0", 18);

    //   await expect(
    //     saveErc20.connect(otherAccount).deposit(depositAmount)
    //   ).to.be.revertedWith("can't deposit zero");
        
    // });


  });


});
