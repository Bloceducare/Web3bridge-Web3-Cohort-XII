const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('DecentralizedCrowdfunding', function () {
  let Crowdfunding, crowdfunding, ERC20, token, owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    ERC20 = await ethers.getContractFactory('TokenA');
    token = await ERC20.deploy(owner.address, owner.address);
    await token.waitForDeployment();

    await token.transfer(addr1.address, ethers.parseEther('500'));
    await token.transfer(addr2.address, ethers.parseEther('500'));

    // Deploy the crowdfunding contract
    Crowdfunding = await ethers.getContractFactory('DecentralizedCrowdfunding');
    crowdfunding = await Crowdfunding.deploy();
    await crowdfunding.waitForDeployment();
  });

  it('Should create a project successfully', async function () {
    await expect(
      crowdfunding.createProject(token.target, ethers.parseEther('100'), 86400)
    ).to.emit(crowdfunding, 'ProjectCreated');

    const project = await crowdfunding.projects(1);
    expect(project.creator).to.equal(owner.address);
    expect(project.goal).to.equal(ethers.parseEther('100'));
  });

  it('Should allow contributions and update balances', async function () {
    await crowdfunding.createProject(
      token.target,
      ethers.parseEther('100'),
      86400
    );
    await token
      .connect(addr1)
      .approve(crowdfunding.target, ethers.parseEther('50'));

    await expect(
      crowdfunding.connect(addr1).contribute(1, ethers.parseEther('50'))
    ).to.emit(crowdfunding, 'ContributionMade');

    const project = await crowdfunding.projects(1);
    expect(project.amountRaised).to.equal(ethers.parseEther('50'));
  });

  it('Should release funds to creator if goal is met', async function () {
    await crowdfunding.createProject(
      token.target,
      ethers.parseEther('100'),
      86400
    );
    await token
      .connect(addr1)
      .approve(crowdfunding.target, ethers.parseEther('100'));
    await crowdfunding.connect(addr1).contribute(1, ethers.parseEther('100'));

    await expect(crowdfunding.connect(owner).releaseFunds(1)).to.emit(
      crowdfunding,
      'FundsReleased'
    );
  });

  it('Should allow refunds if goal is not met', async function () {
    await crowdfunding.createProject(token.target, ethers.parseEther('100'), 86400); // Short duration
    await token
      .connect(addr1)
      .approve(crowdfunding.target, ethers.parseEther('50'));
    await crowdfunding.connect(addr1).contribute(1, ethers.parseEther('50'));

    await expect(crowdfunding.connect(addr1).claimRefund(1)).to.emit(
      crowdfunding,
      'RefundIssued'
    );
  });
});
