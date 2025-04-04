import { expect } from "chai";
import { ethers } from "hardhat";
import { parseEther, Signer } from "ethers";

describe("SchoolManagement", function () {
  let schoolManagement: any;
  let principal: Signer, pupil: Signer, instructor: Signer, otherUser: Signer;

  beforeEach(async function () {
    [principal, pupil, instructor, otherUser] = await ethers.getSigners();
    const SchoolManagementFactory = await ethers.getContractFactory("SchoolManagement");
    schoolManagement = await SchoolManagementFactory.deploy();
  });

  it("Should set the deployer as the principal", async function () {
    expect(await schoolManagement.principal()).to.equal(await principal.getAddress());
  });

  it("Should allow principal to add a pupil", async function () {
    await schoolManagement.connect(principal).addPupil(await pupil.getAddress(), 15, "John Doe");
    const storedPupil = await schoolManagement.pupils(await pupil.getAddress());

    expect(storedPupil.pupilId).to.equal(await pupil.getAddress());
    expect(storedPupil.age).to.equal(15);
    expect(storedPupil.fullName).to.equal("John Doe");
  });

  it("Should revert if a non-principal tries to add a pupil", async function () {
    await expect(
      schoolManagement.connect(otherUser).addPupil(await pupil.getAddress(), 15, "Jane Doe")
    ).to.be.revertedWith("Only the principal can perform this function.");
  });

  it("Should allow principal to add an instructor", async function () {
    await schoolManagement.connect(principal).addInstructor(await instructor.getAddress(), "Prof. Smith");
    const storedInstructor = await schoolManagement.instructors(await instructor.getAddress());

    expect(storedInstructor.instructorId).to.equal(await instructor.getAddress());
    expect(storedInstructor.fullName).to.equal("Prof. Smith");
  });

  it("Should revert if a non-principal tries to add an instructor", async function () {
    await expect(
      schoolManagement.connect(otherUser).addInstructor(await instructor.getAddress(), "Dr. Brown")
    ).to.be.revertedWith("Only the principal can perform this function.");
  });

  it("Should allow principal to set the school fee", async function () {
    await schoolManagement.connect(principal).setFee(1000);
    expect(await schoolManagement.currentFee()).to.equal(1000);
  });

  it("Should revert if a non-principal tries to set the school fee", async function () {
    await expect(schoolManagement.connect(otherUser).setFee(500)).to.be.revertedWith(
      "Only the principal can perform this function."
    );
  });

  it("Should allow a registered pupil to pay the school fee", async function () {
    await schoolManagement.connect(principal).addPupil(await pupil.getAddress(), 16, "Alice Doe");
    await schoolManagement.connect(principal).setFee(parseEther("1"));

    await expect(
      schoolManagement.connect(pupil).payFee({ value: parseEther("1") })
    ).to.emit(schoolManagement, "FeePaid").withArgs(await pupil.getAddress(), parseEther("1"));
  });

  it("Should revert if a non-registered pupil tries to pay the school fee", async function () {
    await schoolManagement.connect(principal).setFee(parseEther("1"));

    await expect(
      schoolManagement.connect(otherUser).payFee({ value: parseEther("1") })
    ).to.be.revertedWith("Only registered pupils can pay the school fee.");
  });

  it("Should revert if incorrect fee amount is sent", async function () {
    await schoolManagement.connect(principal).addPupil(await pupil.getAddress(), 16, "Alice Doe");
    await schoolManagement.connect(principal).setFee(parseEther("1"));

    await expect(
      schoolManagement.connect(pupil).payFee({ value: parseEther("0.5") })
    ).to.be.revertedWith("Incorrect fee amount sent.");
  });

  it("Should allow the principal to withdraw funds", async function () {
    await schoolManagement.connect(principal).setFee(parseEther("1"));
    await schoolManagement.connect(principal).addPupil(await pupil.getAddress(), 16, "Alice Doe");
    await schoolManagement.connect(pupil).payFee({ value: parseEther("1") });

    await expect(schoolManagement.connect(principal).withdraw(parseEther("1"))).to.changeEtherBalance(
      principal,
      parseEther("1")
    );
  });

  it("Should revert if a non-principal tries to withdraw funds", async function () {
    await expect(schoolManagement.connect(otherUser).withdraw(parseEther("1"))).to.be.revertedWith(
      "Only the principal can perform this function."
    );
  });

  it("Should revert if withdrawal amount exceeds contract balance", async function () {
    await expect(schoolManagement.connect(principal).withdraw(parseEther("1"))).to.be.revertedWith(
      "Insufficient contract balance."
    );
  });
});