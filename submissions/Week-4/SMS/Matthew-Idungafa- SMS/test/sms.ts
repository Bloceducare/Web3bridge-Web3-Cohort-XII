import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";

describe("SchoolManagement", function () {
  async function deploySchoolManagementFixture() {
    const [owner, staff1, student1] = await hre.ethers.getSigners();
    const SchoolManagement = await hre.ethers.getContractFactory(
      "SchoolManagement"
    );
    const schoolManagement = await SchoolManagement.deploy();
    await schoolManagement.waitForDeployment();

    return { schoolManagement, owner, staff1, student1 };
  }

  describe("Deployment", function () {
    it("Should set the principal correctly", async function () {
      const { schoolManagement, owner } = await loadFixture(
        deploySchoolManagementFixture
      );
      expect(await schoolManagement.principal()).to.equal(owner.address);
    });
  });

  describe("Staff Management", function () {
    it("Should allow the principal to add staff", async function () {
      const { schoolManagement } = await loadFixture(
        deploySchoolManagementFixture
      );
      await schoolManagement.addStaff("John Doe");
      const staff = await schoolManagement.getStaffDetails(1);
      expect(staff[0]).to.equal("John Doe");
    });

    it("Should prevent non-principal from adding staff", async function () {
      const { schoolManagement, staff1 } = await loadFixture(
        deploySchoolManagementFixture
      );
      await expect(
        schoolManagement.connect(staff1).addStaff("Jane Doe")
      ).to.be.revertedWith("Only the principal can perform this action");
    });

    it("Should allow the principal to remove staff", async function () {
      const { schoolManagement } = await loadFixture(
        deploySchoolManagementFixture
      );
      await schoolManagement.addStaff("John Doe");
      await schoolManagement.removeStaff(1);
      await expect(schoolManagement.getStaffDetails(1)).to.be.revertedWith(
        "Staff does not exist"
      );
    });
  });

  describe("Student Management", function () {
    it("Should allow a staff member to add a student", async function () {
      const { schoolManagement } = await loadFixture(
        deploySchoolManagementFixture
      );
      await schoolManagement.addStaff("John Doe");
      await schoolManagement.addStudent("Alice");
      const student = await schoolManagement.getStudentDetails(1);
      expect(student[0]).to.equal("Alice");
    });

    it("Should prevent non-staff from adding students", async function () {
      const { schoolManagement, student1 } = await loadFixture(
        deploySchoolManagementFixture
      );
      await expect(
        schoolManagement.connect(student1).addStudent("Bob")
      ).to.be.revertedWith("Only an active staff can perform this action");
    });

    it("Should allow staff to remove a student", async function () {
      const { schoolManagement } = await loadFixture(
        deploySchoolManagementFixture
      );
      await schoolManagement.addStaff("John Doe");
      await schoolManagement.addStudent("Alice");
      await schoolManagement.removeStudent(1);
      await expect(schoolManagement.getStudentDetails(1)).to.be.revertedWith(
        "Student does not exist"
      );
    });
  });

  describe("Fee Payments", function () {
    it("Should allow students to pay fees", async function () {
      const { schoolManagement, student1 } = await loadFixture(
        deploySchoolManagementFixture
      );
      await schoolManagement.addStaff("John Doe");
      await schoolManagement.addStudent("Alice");

      await schoolManagement
        .connect(student1)
        .payFees({ value: hre.ethers.parseEther("1") });
      const student = await schoolManagement.getStudentDetails(1);
      expect(student[2]).to.equal(hre.ethers.parseEther("1"));
    });

    it("Should prevent paying fees with zero amount", async function () {
      const { schoolManagement, student1 } = await loadFixture(
        deploySchoolManagementFixture
      );
      await schoolManagement.addStaff("John Doe");
      await schoolManagement.addStudent("Alice");
      await expect(
        schoolManagement.connect(student1).payFees({ value: 0 })
      ).to.be.revertedWith("Amount must be greater than 0");
    });
  });
});
