import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { parseUnits } from "ethers";
import hre from "hardhat";

describe("Piggy Bank", () => {
  const deployPiggyBankContract = async () => {
    const withdrawalDay = (await time.latest()) + 7 * 24 * 60 * 60; // 7 days later
    const targetAmount = parseUnits("200", 18); // 200 USDB (6 decimals)

    const [tokenOwner, account2, account3, manager] =
      await hre.ethers.getSigners();

    // Deploy Mock USDB Token
    const USDB = await hre.ethers.getContractFactory("USDB");
    const usdbDeploy = await USDB.deploy(tokenOwner);
    const usdbDeployContrAddr = await usdbDeploy.getAddress();

    // Deploy Mock NFT Token
    const NFT = await hre.ethers.getContractFactory("VIPContributor");
    const nftDeploy = await NFT.deploy();
    const nftAddress = await nftDeploy.getAddress();

    // Deploy PiggyBank Contract
    const PiggyBank = await hre.ethers.getContractFactory("PiggyBank");
    const deployPiggyBank = await PiggyBank.deploy(
      usdbDeployContrAddr,
      nftAddress,
      targetAmount,
      withdrawalDay,
      manager.address
    );

    return {
      usdbDeploy,
      nftDeploy,
      deployPiggyBank,
      tokenOwner,
      account2,
      account3,
      manager,
      withdrawalDay,
    };
  };

  describe("Deployment", () => {
    it("Should set the manager and correct withdrawal day", async () => {
      const { usdbDeploy, deployPiggyBank, manager, withdrawalDay } =
        await loadFixture(deployPiggyBankContract);

      expect(await deployPiggyBank.USDBContract()).to.equal(
        await usdbDeploy.getAddress()
      );
      expect(await deployPiggyBank.manager()).to.equal(manager.address);
      expect(await deployPiggyBank.targetAmount()).to.equal(
        parseUnits("200", 18)
      );
      expect(await deployPiggyBank.withdrawalDate()).to.equal(withdrawalDay);
    });

    it("Should revert if withdrawal date set during deployment is in the past", async () => {
      const { usdbDeploy, nftDeploy, tokenOwner } = await loadFixture(
        deployPiggyBankContract
      );
      const pastWithdrawalDate = (await time.latest()) - 1;

      await expect(
        hre.ethers
          .getContractFactory("PiggyBank")
          .then((PiggyBank) =>
            PiggyBank.deploy(
              usdbDeploy.getAddress(),
              nftDeploy.getAddress(),
              parseUnits("100", 18),
              pastWithdrawalDate,
              tokenOwner.address
            )
          )
      ).to.be.revertedWith("WITHDRAWAL MUST BE IN FUTURE");
    });

    it("Should revert if target amount is zero", async () => {
      const { usdbDeploy, nftDeploy, tokenOwner, withdrawalDay } =
        await loadFixture(deployPiggyBankContract);

      await expect(
        hre.ethers
          .getContractFactory("PiggyBank")
          .then((PiggyBank) =>
            PiggyBank.deploy(
              usdbDeploy.getAddress(),
              nftDeploy.getAddress(),
              0,
              withdrawalDay,
              tokenOwner.address
            )
          )
      ).to.be.revertedWith("Target amount must be greater than zero");
    });
  });

  describe("Save Function", () => {
    it("Should revert if saving period has ended", async () => {
      const { usdbDeploy, deployPiggyBank, tokenOwner, account2 } =
        await loadFixture(deployPiggyBankContract);

      //   Ensure account2 has tokens before saving
      await usdbDeploy
        .connect(tokenOwner)
        .transfer(account2, parseUnits("1000", 18));

      // Fast-forward to after withdrawal date
      expect(await time.latest())
        .to.be.lessThanOrEqual(await deployPiggyBank.withdrawalDate())
        .to.be.revertedWith("YOU CAN NO LONGER SAVE");
    });

    it("Should revert if user balance is insufficient", async () => {
      const { deployPiggyBank, account2 } = await loadFixture(
        deployPiggyBankContract
      );

      const _amountToContribute = parseUnits("20", 18);

      await expect(
        deployPiggyBank.connect(account2).save(_amountToContribute)
      ).to.be.revertedWith("YOU ARE BROKE");
    });

    it("Should save USDB in the contract", async () => {
      const { deployPiggyBank, usdbDeploy, tokenOwner } = await loadFixture(
        deployPiggyBankContract
      );

      const _amountToContribute = parseUnits("500", 18);

      await usdbDeploy.approve(
        deployPiggyBank.getAddress(),
        _amountToContribute
      );

      const contrCountBefore = await deployPiggyBank.contributorsCount();

      await deployPiggyBank.connect(tokenOwner).save(_amountToContribute);

      const contrCountAfter = await deployPiggyBank.contributorsCount();

      expect(
        (await deployPiggyBank.contributionsAmnt(tokenOwner)) +
          _amountToContribute
      );

      expect(contrCountAfter).to.be.greaterThan(contrCountBefore);
    });

    it("Should send NFT to who is saving for the second time", async () => {
      const { deployPiggyBank, usdbDeploy, nftDeploy, tokenOwner, account2 } =
        await loadFixture(deployPiggyBankContract);

      await usdbDeploy.transfer(account2, parseUnits("1000", 18));

      const _amountToContribute1 = parseUnits("500", 18);

      await usdbDeploy
        .connect(account2)
        .approve(deployPiggyBank.getAddress(), _amountToContribute1);

      await deployPiggyBank.connect(account2).save(_amountToContribute1);

      // Check contributions count
      expect(await deployPiggyBank.contributorCount(account2.address)).to.equal(
        1
      );

      // Second contribution
      const _amountToContribute2 = parseUnits("100", 18);

      await usdbDeploy
        .connect(account2)
        .approve(deployPiggyBank.getAddress(), _amountToContribute2);

    //   await nftDeploy.safeMint(deployPiggyBank.getAddress());
      await nftDeploy.safeMint(account2);

    //   await nftDeploy.approve(deployPiggyBank.getAddress(), 0);

      await expect(
        deployPiggyBank.connect(account2).save(_amountToContribute2)
      )
        .to.emit(deployPiggyBank, "NFTMinted") // Check if NFTMinted event is emitted
        .withArgs(deployPiggyBank.getAddress(), account2.address);

      // Check contributions count
      expect(
        await deployPiggyBank.contributorCount(account2.address)
      ).to.equal(2);

      // Verify that NFT was minted
      expect(await nftDeploy.balanceOf(account2.address)).to.equal(1);
    });
  });

  describe("Withdrawal Function", () => {
    it("Should revert if non-manager tries to withdraw", async () => {
      const { deployPiggyBank, account2 } = await loadFixture(
        deployPiggyBankContract
      );

      await expect(
        deployPiggyBank.connect(account2).withdrawal()
      ).to.be.revertedWith("YOU WAN THIEF ABI ?");
    });

    it("Should revert if withdrawal is attempted before the due date", async () => {
      const { deployPiggyBank, manager } = await loadFixture(
        deployPiggyBankContract
      );

      await expect(
        deployPiggyBank.connect(manager).withdrawal()
      ).to.be.revertedWith("NOT YET TIME");
    });

    it("Should revert if target amount is not reached", async () => {
      const { deployPiggyBank, manager } = await loadFixture(
        deployPiggyBankContract
      );

      // Fast-forward time to withdrawal date
      await time.increaseTo(await deployPiggyBank.withdrawalDate());

      await expect(
        deployPiggyBank.connect(manager).withdrawal()
      ).to.be.revertedWith("TARGET AMOUNT NOT REACHED");
    });

    it("Should allow manager to withdraw funds after target is reached", async () => {
      const { usdbDeploy, deployPiggyBank, tokenOwner, manager } =
        await loadFixture(deployPiggyBankContract);

      const _amountToContribute = parseUnits("200", 18);

      // Ensure tokenOwner has enough tokens
      await usdbDeploy
        .connect(tokenOwner)
        .transfer(tokenOwner.address, _amountToContribute);

      // Approve PiggyBank contract to spend tokenOwner's USDB
      await usdbDeploy
        .connect(tokenOwner)
        .approve(await deployPiggyBank.getAddress(), _amountToContribute);

      // Save the full amount to reach the target
      await deployPiggyBank.connect(tokenOwner).save(_amountToContribute);

      // Fast-forward time beyond withdrawal date
      const withdrawTime = (await deployPiggyBank.withdrawalDate()) + BigInt(2);
      await time.increaseTo(withdrawTime);

      //   const piggyContrBal = usdbDeploy.balanceOf(deployPiggyBank.getAddress());

      // Manager withdraws funds
      await expect(deployPiggyBank.connect(manager).withdrawal()).to.emit(
        deployPiggyBank,
        "Withdrawn"
      );
      // .withArgs(piggyContrBal, withdrawTime + BigInt(2));

      // Ensure contract balance is zero after withdrawal
      const contractBalance = await usdbDeploy.balanceOf(
        await deployPiggyBank.getAddress()
      );
      expect(contractBalance).to.equal(0);
    });
  });
});
