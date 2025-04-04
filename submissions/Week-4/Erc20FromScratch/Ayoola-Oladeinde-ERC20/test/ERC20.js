const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('MyToken', function () {
  let MyToken, myToken;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    MyToken = await ethers.getContractFactory('MyToken');
    myToken = await MyToken.deploy('Custom Token', 'CTK', 18, 1000); // 1000 initial supply
    await myToken.waitForDeployment();
  });

  it('Should deploy with correct details', async function () {
    expect(await myToken.name()).to.equal('Custom Token');
    expect(await myToken.symbol()).to.equal('CTK');
    expect(await myToken.decimals()).to.equal(18);
    expect(await myToken.totalSupply()).to.equal(ethers.parseUnits('1000', 18));
  });

  it('Should assign total supply to owner', async function () {
    const ownerBalance = await myToken.balanceOf(owner.address);
    expect(ownerBalance).to.equal(await myToken.totalSupply());
  });

  it('Should allow transfer of tokens', async function () {
    await myToken.transfer(addr1.address, ethers.parseUnits('100', 18));
    expect(await myToken.balanceOf(addr1.address)).to.equal(ethers.parseUnits('100', 18));
  });

  it('Should prevent transfer when balance is insufficient', async function () {
    await expect(
      myToken.connect(addr1).transfer(owner.address, ethers.parseUnits('50', 18))
    ).to.be.revertedWith('Insufficient balance');
  });

  it('Should allow owner to mint new tokens', async function () {
    await myToken.mint(addr1.address, ethers.parseUnits('500', 18));
    expect(await myToken.balanceOf(addr1.address)).to.equal(ethers.parseUnits('500', 18));
  });

  it('Should not allow non-owner to mint tokens', async function () {
    await expect(
      myToken.connect(addr1).mint(addr1.address, ethers.parseUnits('100', 18))
    ).to.be.revertedWith('Not contract owner');
  });

  it('Should allow an address to approve another address for spending', async function () {
    await myToken.approve(addr1.address, ethers.parseUnits('200', 18));
    expect(await myToken.allowance(owner.address, addr1.address)).to.equal(ethers.parseUnits('200', 18));
  });

  it('Should allow transferFrom when approved', async function () {
    await myToken.transfer(addr1.address, ethers.parseUnits('100', 18));
    await myToken.connect(addr1).approve(addr2.address, ethers.parseUnits('50', 18));

    await myToken.connect(addr2).transferFrom(addr1.address, addr2.address, ethers.parseUnits('50', 18));

    expect(await myToken.balanceOf(addr2.address)).to.equal(ethers.parseUnits('50', 18));
    expect(await myToken.balanceOf(addr1.address)).to.equal(ethers.parseUnits('50', 18));
  });

  it('Should not allow transferFrom if allowance is exceeded', async function () {
    await myToken.transfer(addr1.address, ethers.parseUnits('100', 18));
    await myToken.connect(addr1).approve(addr2.address, ethers.parseUnits('30', 18));

    await expect(
      myToken.connect(addr2).transferFrom(addr1.address, addr2.address, ethers.parseUnits('50', 18))
    ).to.be.revertedWith('Allowance exceeded');
  });
});
