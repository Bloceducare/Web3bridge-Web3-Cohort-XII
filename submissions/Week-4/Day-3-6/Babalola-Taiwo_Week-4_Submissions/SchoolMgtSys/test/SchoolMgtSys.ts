import { time, loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { SchoolMgtSys } from "./SchoolMgtSys";  // Import your contract
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("SchoolMgtSys", function () {
  let school: SchoolMgtSys;
  let owner: SignerWithAddress;
  let staff1: SignerWithAddress;
  let student1: SignerWithAddress;
  let student2: SignerWithAddress;

  beforeEach(async () => {
    [owner, staff1, student1, student2] = await ethers.getSigners();
    const SchoolMgtSysFactory = await ethers.getContractFactory("SchoolMgtSys");
    school = (await SchoolMgtSysFactory.deploy()) as SchoolMgtSys;
    await school.deployed();
});

  it("Should set the proprietor as the contract deployer", async function () {
    expect(await school.proprietor()).to.equal(await owner.getAddress());
  });

  it("Should allow proprietor to set school name", async function () {
    await school.setSchoolName("Tech Academy");
    expect(await school.schoolName()).to.equal("Tech Academy");
  });

  it("Should allow proprietor to register a staff", async function () {
    await school.registerStaff(1, "Alice", "Female", 30, "Math", await staff1.getAddress());
    const staff = await school.staffList(1);
    expect(staff._name).to.equal("Alice");
    expect(await school.staffStatus(await staff1.getAddress())).to.be.true;
  });

  it("Should allow proprietor to register a student", async function () {
    await school.registerStudent(1, "Bob", "Male", 15, "Grade 10", await student1.getAddress());
    const student = await school.studentList(1);
    expect(student.name).to.equal("Bob");
    expect(await school.studentStatus(await student1.getAddress())).to.be.true;
  });

  it("Should allow students to pay fees", async function () {
    const feeAmount = ethers.parseEther("1");

    await school.registerStudent(1, "Bob", "Male", 15, "Grade 10", await student1.getAddress());

    await school.connect(student1).payFees(1, { value: feeAmount });

    const balance = await school.feeBalance(1);
    expect(balance).to.equal(feeAmount);
  });

  it("Should prevent non-proprietors from registering students", async function () {
    await expect(
      school.connect(staff1).registerStudent(2, "Eve", "Female", 14, "Grade 8", await student2.getAddress())
    ).to.be.revertedWith("Only Proprietor Access");
  });
});
