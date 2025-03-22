import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { ethers as ethersLib } from "ethers";
import { Agreement } from "../typechain-types";

describe("Agreement Contract", function () {
  let agreement: Agreement;
  let owner: any, partyB: any, nonParty: any;
  const depositAmount = ethers.parseEther("1");

  beforeEach(async function () {
    [owner, partyB, nonParty] = await ethers.getSigners();

    const Agreement = await ethers.getContractFactory("Agreement");
    agreement = await Agreement.deploy(partyB.address, depositAmount, { value: depositAmount });
    await agreement.waitForDeployment();
  });

  it("should deploy with correct values", async function () {
    expect(await agreement.partyA()).to.equal(owner.address);
    expect(await agreement.partyB()).to.equal(partyB.address);
    expect(await agreement.amount()).to.equal(depositAmount);
  });

  it("should allow either party to sign the agreement", async function () {
    await agreement.connect(owner).signAgreement();
    expect(await agreement.agreementSigned()).to.be.true;
  });

  it("should not allow non-parties to sign", async function () {
    await expect(agreement.connect(nonParty).signAgreement()).to.be.revertedWith("Not a party to the agreement");
  });

  it("should allow partyA to release funds after signing", async function () {
    await agreement.connect(owner).signAgreement();

    const balanceBefore = await ethers.provider.getBalance(partyB.address);
    await agreement.connect(owner).releaseFunds();
    const balanceAfter = await ethers.provider.getBalance(partyB.address);

    expect(await agreement.fundsReleased()).to.be.true;
    expect(balanceAfter).to.be.gt(balanceBefore);
  });

  it("should not allow funds to be released before signing", async function () {
    await expect(agreement.connect(owner).releaseFunds()).to.be.revertedWith("Agreement not signed yet");
  });

  it("should not allow non-partyA to release funds", async function () {
    await agreement.connect(owner).signAgreement();
    await expect(agreement.connect(partyB).releaseFunds()).to.be.revertedWith("Only partyA can release funds");
  });

//   it("should allow partyA to cancel the agreement and receive a refund", async function () {
//     const balanceBefore = await ethers.provider.getBalance(owner.address);

//     // Cancel the agreement
//     const tx = await agreement.connect(owner).cancelAgreement();
//     const receipt = await tx.wait();

//     // Get the balance of partyA after the transaction
//     const balanceAfter = await ethers.provider.getBalance(owner.address);

//     // Check if balanceAfter is higher by the amount of the deposit
//     expect(balanceAfter).to.be.gt(balanceBefore);

//     // Ensure contract's state is reset
//     expect(await agreement.partyB()).to.equal(ethersLib.constants.AddressZero);
//     expect(await agreement.partyB()).to.equal(ethersLib.constants.AddressZero);

//     // Ensure calling contract functions fail
//     await expect(agreement.connect(owner).releaseFunds()).to.be.revertedWith("Agreement not signed yet");
// });

  it("should not allow cancellation after funds are released", async function () {
    await agreement.connect(owner).signAgreement();
    await agreement.connect(owner).releaseFunds();
    await expect(agreement.connect(owner).cancelAgreement()).to.be.revertedWith("Funds already released");
  });
});
