import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("Airdrop", function () {
  let myToken: any;
  let airdrop: any;
  let owner: any;
  let addr1: any;
  let addr2: any;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy the ERC20 token
    const MyToken = await ethers.getContractFactory("MyToken");
    myToken = await MyToken.deploy(ethers.utils.parseEther("1000000")); // 1 million tokens
    await myToken.deployed();

    // Deploy the Airdrop contract
    const Airdrop = await ethers.getContractFactory("Airdrop");
    airdrop = await Airdrop.deploy(myToken.address);
    await airdrop.deployed();
  });

  it("Should allow users to stake tokens", async function () {
    // Approve the staking contract to spend tokens
    await myToken.connect(addr1).approve(airdrop.address, ethers.utils.parseEther("100"));

    // Stake tokens
    await airdrop.connect(addr1).stake(ethers.utils.parseEther("100"));
    const stake = await airdrop.stakes(addr1.address);

    expect(stake.amount).to.equal(ethers.utils.parseEther("100"));
  });

  it("Should calculate rewards correctly", async function () {
    // Approve and stake tokens
    await myToken.connect(addr1).approve(airdrop.address, ethers.utils.parseEther("100"));
    await airdrop.connect(addr1).stake(ethers.utils.parseEther("100"));

    // Fast-forward time by 365 days
    await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine", []);

    // Calculate rewards
    const reward = await airdrop.calculateReward(addr1.address);
    expect(reward).to.equal(ethers.utils.parseEther("10")); // 10% of 100 tokens
  });

  it("Should allow users to withdraw stake and rewards", async function () {
    // Approve and stake tokens
    await myToken.connect(addr1).approve(airdrop.address, ethers.utils.parseEther("100"));
    await airdrop.connect(addr1).stake(ethers.utils.parseEther("100"));

    // Fast-forward time by 365 days
    await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine", []);

    // Withdraw stake and rewards
    await airdrop.connect(addr1).withdraw();
    const balance = await myToken.balanceOf(addr1.address);
    expect(balance).to.equal(ethers.utils.parseEther("110")); // 100 staked + 10 rewards
  });

  it("Should airdrop tokens to multiple recipients", async function () {
    // Approve the airdrop contract to spend tokens
    await myToken.connect(owner).approve(airdrop.address, ethers.utils.parseEther("200"));

    // Airdrop tokens
    await airdrop.connect(owner).airdropTokens(
      [addr1.address, addr2.address],
      [ethers.utils.parseEther("100"), ethers.utils.parseEther("100")]
    );

    // Check balances
    expect(await myToken.balanceOf(addr1.address)).to.equal(ethers.utils.parseEther("100"));
    expect(await myToken.balanceOf(addr2.address)).to.equal(ethers.utils.parseEther("100"));
  });
});
