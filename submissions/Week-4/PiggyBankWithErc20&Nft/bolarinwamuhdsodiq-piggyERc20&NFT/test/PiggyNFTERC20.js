const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("PiggyBankMineNFTERC", async () => {
  async function deployPiggyBankMineNFTERC() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const PiggyBankMineNFTERC = await ethers.getContractFactory(
      "PiggyBankMineNFTERC"
    );

    const TokenDeploy = await ethers.getContractFactory("MockERC20");

    const tokenDeploy = await TokenDeploy.deploy("MyMOCK", "Mock");

    const piggyBankMineNFTERC = await PiggyBankMineNFTERC.deploy(
      tokenDeploy.target
    );

    const mintToken = await tokenDeploy.mint(
      owner.address,
      ethers.parseEther("10000000000")
    );

    return { piggyBankMineNFTERC, owner, otherAccount, mintToken, tokenDeploy };
  }

  describe("Deployment", function () {
    it("Should deploy the PiggyBankMineNFTERC contract", async function () {
      const { piggyBankMineNFTERC, owner } = await loadFixture(
        deployPiggyBankMineNFTERC
      );
    });
  });

  describe("Deposits", function () {
    it("Should revert when deposit amount is zero", async function () {
      const { piggyBankMineNFTERC } = await loadFixture(
        deployPiggyBankMineNFTERC
      );

      await expect(
        piggyBankMineNFTERC.deposit({ value: ethers.parseEther("0") })
      ).to.be.revertedWith("You must deposit some Ether");
    });

    it("Should update user balance after deposit", async function () {
      const { piggyBankMineNFTERC, owner, tokenDeploy } = await loadFixture(
        deployPiggyBankMineNFTERC
      );

      await tokenDeploy.approve(
        piggyBankMineNFTERC.target,
        ethers.parseEther("2.0")
      );
      await piggyBankMineNFTERC
        .connect(owner)
        .deposit({ value: ethers.parseEther("1.0") });

      const userBalance = await piggyBankMineNFTERC
        .connect(owner)
        .users(owner.address);
      // console.log(userBalance, "userBalance")
      await expect(userBalance.balance).to.equal(ethers.parseEther("1.0"));
    });

    it("Should increment deposit count", async function () {
      const { piggyBankMineNFTERC, owner, tokenDeploy } = await loadFixture(
        deployPiggyBankMineNFTERC
      );
      const depositAmount = ethers.parseEther("1");
      await tokenDeploy.approve(
        piggyBankMineNFTERC.target,
        ethers.parseEther("2.0")
      );

      await piggyBankMineNFTERC
        .connect(owner)
        .deposit({ value: depositAmount });
      const user = await piggyBankMineNFTERC.users(owner.address);
      expect(user.depositCount).to.equal(1);
    });

    it("Should transfer ERC20 tokens correctly", async function () {
      const { piggyBankMineNFTERC, owner, tokenDeploy } = await loadFixture(
        deployPiggyBankMineNFTERC
      );
      const depositAmount = ethers.parseEther("1.0");

      await tokenDeploy.approve(
        piggyBankMineNFTERC.target,
        ethers.parseEther("2.0")
      );

      const balanceBefore = await tokenDeploy.balanceOf(owner.address);

      await piggyBankMineNFTERC
        .connect(owner)
        .deposit({ value: ethers.parseEther("1.0") });

      const balanceAfter = await tokenDeploy.balanceOf(owner.address);

      expect(balanceBefore - balanceAfter).to.equal(depositAmount);
    });

    it("Should emit Deposited event", async function () {
      const { piggyBankMineNFTERC, owner, tokenDeploy } = await loadFixture(
        deployPiggyBankMineNFTERC
      );
      const depositAmount = ethers.parseEther("1.0");
      await tokenDeploy.approve(
        piggyBankMineNFTERC.target,
        ethers.parseEther("2.0")
      );

      await expect(
        piggyBankMineNFTERC.connect(owner).deposit({ value: depositAmount })
      )
        .to.emit(piggyBankMineNFTERC, "Deposited")
        .withArgs(owner.address, depositAmount);
    });

    it("Should mint NFT after second deposit", async function () {
      const { piggyBankMineNFTERC, owner, tokenDeploy } = await loadFixture(
        deployPiggyBankMineNFTERC
      );
      const depositAmount = ethers.parseEther("1");
      await tokenDeploy.approve(
        piggyBankMineNFTERC.target,
        ethers.parseEther("4.0")
      );

      await piggyBankMineNFTERC
        .connect(owner)
        .deposit({ value: depositAmount });
      expect(await piggyBankMineNFTERC.balanceOf(owner.address)).to.equal(0);

      await piggyBankMineNFTERC
        .connect(owner)
        .deposit({ value: depositAmount });
      expect(await piggyBankMineNFTERC.balanceOf(owner.address)).to.equal(1);

      const user = await piggyBankMineNFTERC.users(owner.address);
      expect(user.hasNFT).to.be.true;
    });

    it("Should not mint NFT on third deposit", async function () {
      const { piggyBankMineNFTERC, owner, tokenDeploy } = await loadFixture(
        deployPiggyBankMineNFTERC
      );
      const depositAmount = ethers.parseEther("1");

      await tokenDeploy.approve(
        piggyBankMineNFTERC.target,
        ethers.parseEther("6.0")
      );

      await piggyBankMineNFTERC
        .connect(owner)
        .deposit({ value: depositAmount });

      await piggyBankMineNFTERC
        .connect(owner)
        .deposit({ value: depositAmount });

      
      await piggyBankMineNFTERC
        .connect(owner)
        .deposit({ value: depositAmount });

      const nftBalance = await piggyBankMineNFTERC.balanceOf(owner.address);
      expect(nftBalance).to.equal(1n);
    });

    it("Should revert if ERC20 transfer fails", async function () {
      const { piggyBankMineNFTERC, owner, tokenDeploy } = await loadFixture(
        deployPiggyBankMineNFTERC
      );
      const depositAmount = ethers.parseEther("1");

      await tokenDeploy.approve(piggyBankMineNFTERC.target, 0);

      await expect(
        piggyBankMineNFTERC.connect(owner).deposit({ value: depositAmount })
      ).to.be.revertedWith("ERC20: insufficient allowance");
    });
  });
});
