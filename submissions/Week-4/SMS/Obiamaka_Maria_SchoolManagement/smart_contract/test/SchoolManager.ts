import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("SchoolManagement Test", function () {
  const deploySchoolManagementContract = async () => {
    const [owner, account1, account2, account3] = await hre.ethers.getSigners();
    const SchoolManagement = await hre.ethers.getContractFactory("SchoolManagement");
    const deployedSchoolManagement = await SchoolManagement.deploy();
    await deployedSchoolManagement.waitForDeployment();

    return { deployedSchoolManagement, owner, account1, account2, account3 };
  };

  describe("Deployment", function () {
    it("should be deployed by owner", async function () {
      const { deployedSchoolManagement, owner } = await loadFixture(deploySchoolManagementContract);
      expect(await deployedSchoolManagement.principal()).to.equal(owner.address);
    });
  });

  describe("Register Teachers", function () {
    it("should allow only the principal to register a teacher", async function () {
      const { deployedSchoolManagement, owner, account1 } = await loadFixture(deploySchoolManagementContract);
      await expect(deployedSchoolManagement.connect(account1).registerTeacher(account1.address, "Teacher1"))
        .to.be.revertedWith("Only the principal can perform this action");
    });

    it("should successfully register a teacher", async function () {
      const { deployedSchoolManagement, owner, account1 } = await loadFixture(deploySchoolManagementContract);
      await deployedSchoolManagement.registerTeacher(account1.address, "Teacher1");
      const teacher = await deployedSchoolManagement.getTeacher(1);
      expect(teacher.teacherAddress).to.equal(account1.address);
      expect(teacher.name).to.equal("Teacher1");
      expect(teacher.isRegistered).to.equal(true);
    });
  });

  describe("Register Students", function () {
    it("should allow only a teacher or the principal to register a student", async function () {
      const { deployedSchoolManagement, account1, account2 } = await loadFixture(deploySchoolManagementContract);
      await expect(deployedSchoolManagement.connect(account2).registerStudent(account2.address, "Student1"))
        .to.be.revertedWith("Only a teacher or the principal can perform this action");
    });

    it("should successfully register a student", async function () {
      const { deployedSchoolManagement, owner, account1, account2 } = await loadFixture(deploySchoolManagementContract);
      await deployedSchoolManagement.registerTeacher(account1.address, "Teacher1");
      await deployedSchoolManagement.connect(account1).registerStudent(account2.address, "Student1");
      const student = await deployedSchoolManagement.getStudent(1);
      expect(student.studentAddress).to.equal(account2.address);
      expect(student.name).to.equal("Student1");
      expect(student.isRegistered).to.equal(true);
    });
  });

  describe("Fee Payment", function () {
    it("should allow only the student to pay their own fees", async function () {
      const { deployedSchoolManagement, owner, account1, account2 } = await loadFixture(deploySchoolManagementContract);
      await deployedSchoolManagement.registerTeacher(account1.address, "Teacher1");
      await deployedSchoolManagement.connect(account1).registerStudent(account2.address, "Student1");
      await expect(deployedSchoolManagement.payFees(1, { value: hre.ethers.parseEther("0.1") }))
        .to.be.revertedWith("You can only pay your own fees");
    });

    it("should allow a student to pay fees and update their status", async function () {
      const { deployedSchoolManagement, owner, account1, account2 } = await loadFixture(deploySchoolManagementContract);
      await deployedSchoolManagement.registerTeacher(account1.address, "Teacher1");
      await deployedSchoolManagement.connect(account1).registerStudent(account2.address, "Student1");
      await deployedSchoolManagement.connect(account2).payFees(1, { value: hre.ethers.parseEther("0.1") });
      const student = await deployedSchoolManagement.getStudent(1);
      expect(student.feeStatus).to.equal(1); // 1 corresponds to Paid
    });
  });
});