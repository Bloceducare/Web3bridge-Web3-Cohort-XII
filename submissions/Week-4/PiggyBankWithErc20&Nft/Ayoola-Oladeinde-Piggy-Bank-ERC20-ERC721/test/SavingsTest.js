const { expect } = require('chai');
const { ethers } = require('hardhat');
const { time } = require('@nomicfoundation/hardhat-toolbox/network-helpers');

describe('SavingsContract', function () {
  let Token, NFT, SavingsContract;
  let token, nft, savingsContract;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy ERC20 Token
    Token = await ethers.getContractFactory('Saver'); // Replace with your ERC20 contract name
    token = await Token.deploy(owner.address, owner.address);
    await token.waitForDeployment();

    // Deploy ERC721 NFT Contract
    NFT = await ethers.getContractFactory('Savero');
    nft = await NFT.deploy(owner.address); // Owner is initially the contract owner
    await nft.waitForDeployment();

    // Deploy Savings Contract (with token and NFT addresses)
    SavingsContract = await ethers.getContractFactory('SavingsContract');
    savingsContract = await SavingsContract.deploy(
      token.target, // ERC20 Token address
      nft.target // NFT Contract address
    );
    await savingsContract.waitForDeployment();

    // Mint an NFT and transfer it to the SavingsContract
    // Mint NFTs with token IDs 0 to 10 and transfer them to SavingsContract

    await nft.connect(owner).safeMint(owner.address); // Mint to owner
    await nft
      .connect(owner)
      .transferFrom(owner.address, savingsContract.target, 0); // Transfer NFT to contract
  });

  it('Should allow a user to deposit ERC20 tokens', async function () {
    await token.connect(owner).transfer(addr1.address, ethers.parseEther('10')); // Fund addr1 with tokens
    await token
      .connect(addr1)
      .approve(savingsContract.target, ethers.parseEther('5'));

    await savingsContract.connect(addr1).deposit(ethers.parseEther('5'));

    const savingsDetails = await savingsContract
      .connect(addr1)
      .getSavingsDetails();
    expect(savingsDetails.balance).to.equal(ethers.parseEther('5'));
  });

  it('Should allow a user to set a savings goal', async function () {
    await savingsContract
      .connect(addr1)
      .setSavingsGoal(ethers.parseEther('2'), 5);
    const savingsDetails = await savingsContract
      .connect(addr1)
      .getSavingsDetails();
    expect(savingsDetails.goal).to.equal(ethers.parseEther('2'));
  });

  it('Should prevent withdrawal before unlock time', async function () {
    await savingsContract
      .connect(addr1)
      .setSavingsGoal(ethers.parseEther('1'), 5);
    await token.connect(owner).transfer(addr1.address, ethers.parseEther('1'));
    await token
      .connect(addr1)
      .approve(savingsContract.target, ethers.parseEther('1'));
    await savingsContract.connect(addr1).deposit(ethers.parseEther('1'));

    await expect(savingsContract.connect(addr1).withdraw()).to.be.revertedWith(
      'Funds are locked'
    );
  });

  it('Should allow withdrawal after unlock time if goal is met', async function () {
    await savingsContract
      .connect(addr1)
      .setSavingsGoal(ethers.parseEther('1'), 1);
    await token.connect(owner).transfer(addr1.address, ethers.parseEther('1'));
    await token
      .connect(addr1)
      .approve(savingsContract.target, ethers.parseEther('1'));
    await savingsContract.connect(addr1).deposit(ethers.parseEther('1'));

    const ONE_DAY_IN_SECS = 24 * 60 * 60;
    const unlockTime = (await time.latest()) + ONE_DAY_IN_SECS;
    await time.increaseTo(unlockTime);

    await expect(savingsContract.connect(addr1).withdraw())
      .to.emit(savingsContract, 'Withdrawn')
      .withArgs(addr1.address, ethers.parseEther('1'));
  });

  it('Should mint and send NFT after second deposit', async function () {
    await token.connect(owner).transfer(addr1.address, ethers.parseEther('10')); // Fund addr1
    await token
      .connect(addr1)
      .approve(savingsContract.target, ethers.parseEther('10'));
    await nft.connect(owner).setApprovalForAll(savingsContract.target, true);

    await savingsContract.connect(addr1).deposit(ethers.parseEther('3'));
    await savingsContract.connect(addr1).deposit(ethers.parseEther('3')); // Second deposit

    expect(await nft.ownerOf(0)).to.equal(addr1.address); // Verify addr1 received NFT
  });
});
