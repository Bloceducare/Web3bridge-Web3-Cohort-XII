import { expect } from "chai";
import hre from "hardhat";
import { time, loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("ERC20Token", () => {
  const deployFixture = async () => {
    const [manager, owner,account1, account2] = await hre.ethers.getSigners();
    const Token = await hre.ethers.getContractFactory("ERC20Token");
    const ERC20TokenDeploy = await Token.deploy("TestToken", 1000000, 18, "TTK");
    return {ERC20TokenDeploy, owner, account1, account2 };
  };

  describe("Deployment", () => {
    it("should assign the total supply to the contract", async () => {
      const {ERC20TokenDeploy } = await loadFixture(deployFixture);
      expect(await ERC20TokenDeploy.balanceOf(ERC20TokenDeploy.target)).to.equal(1000000n * 10n ** 18n);
    });
  });

  describe("Transfers", () => {
    // it("should transfer tokens to an account", async () => {
    //   const { ERC20TokenDeploy, owner, account1, account2 } = await loadFixture(deployFixture);
    //   await ERC20TokenDeploy._mint(owner.address, 10000000);
    //   await ERC20TokenDeploy.approve(account1.address, 10000);
    //   await ERC20TokenDeploy.transfer(account1.address, 10000);
    //   expect(await ERC20TokenDeploy.balanceOf(account1.address)).to.equal(1000);
    // });

    it("should fail if sender does not have enough balance", async () => {
      const {ERC20TokenDeploy, account1, account2 } = await loadFixture(deployFixture);
      await expect(ERC20TokenDeploy.connect(account1).transfer(account2.address, 1000)).to.be.revertedWith("YOUR BALANCE IS NOT ENOUGH");
    });
  });

  describe("Approvals and TransferFrom", () => {
    // it("should approve and allow transferFrom", async () => {
    //   const {ERC20TokenDeploy, owner, account1, account2 } = await loadFixture(deployFixture);
    //   await ERC20TokenDeploy._mint(account1.address, 1000);
    //   await ERC20TokenDeploy.connect(account1).approve(account2.address, 500);
    //   await ERC20TokenDeploy.connect(account1).approve(owner.address, 500);
    //   await expect(ERC20TokenDeploy.transferFrom(account1.address, account2.address, 500))
    //     .to.emit(ERC20TokenDeploy, "Transfer")
    //     .withArgs(owner.address, account2.address, 500, await time.latest());
    // });

    it("should fail if allowance is insufficient", async () => {
      const {ERC20TokenDeploy, account1, account2 } = await loadFixture(deployFixture);
      await ERC20TokenDeploy._mint(account1.address, 1000);
      await expect(ERC20TokenDeploy.connect(account1).transferFrom(account1.address, account2.address, 100))
        .to.be.revertedWith("INSUFFICIENT ALLOWANCE");
    });
  });

  describe("Minting and Burning", () => {
    it("should mint tokens", async () => {
      const {ERC20TokenDeploy, owner, account1 } = await loadFixture(deployFixture);
      await ERC20TokenDeploy._mint(account1.address, 1000);
      expect(await ERC20TokenDeploy.balanceOf(account1.address)).to.equal(1000);
    });

    it("should not allow non-owner to mint", async () => {
      const { ERC20TokenDeploy, account1 } = await loadFixture(deployFixture);
      await expect(ERC20TokenDeploy.connect(account1)._mint(account1.address, 1000)).to.be.revertedWith("YOU ARE NOT THE OWNER");
    });

    it("should burn tokens", async () => {
      const { ERC20TokenDeploy, owner, account1 } = await loadFixture(deployFixture);
      await ERC20TokenDeploy._mint(account1.address, 1000);
      await ERC20TokenDeploy._burn(account1.address, 500);
      expect(await ERC20TokenDeploy.balanceOf(account1.address)).to.equal(500);
    });
  });
});
