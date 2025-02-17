import { expect } from "chai";
import hre from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("SchoolManagement Contract", function () {
  async function deploySchoolManagement() {
    const [owner, staff, student] = await hre.ethers.getSigners();
    const SchoolManagement = await hre.ethers.getContractFactory("SchoolManagement");
    const schoolManagement = await SchoolManagement.deploy();

    return { schoolManagement, owner, staff, student };
  }

  // STAFF MANAGEMENT
  describe("Staff Management", function () {
    it("Should allow the principal to register a staff member", async function () {
      const { schoolManagement, owner, staff } = await loadFixture(deploySchoolManagement);

      await schoolManagement.connect(owner).createStaff(
        "Jane Doe",
        "Female",
        1,
        "Admin",
        staff.address
      );

      const staffData = await schoolManagement.staffList(1);
      expect(staffData._name).to.equal("Jane Doe");
      expect(staffData._staffAddress).to.equal(staff.address);
    });

    it("Should prevent duplicate staff registration", async function () {
      const { schoolManagement, owner, staff } = await loadFixture(deploySchoolManagement);

      await schoolManagement.connect(owner).createStaff(
        "Jane Doe",
        "Female",
        1,
        "Admin",
        staff.address
      );

      await expect(
        schoolManagement.connect(owner).createStaff(
          "John Doe",
          "Male",
          2,
          "Teacher",
          staff.address 
        )
      ).to.be.revertedWith("STAFF ALREADY REGISTERED");
    });
  });

  // STUDENT MANAGEMENT
  describe("Student Management", function () {
    it("Should allow principal and staff to register a student", async function () {
      const { schoolManagement, owner, staff, student } = await loadFixture(deploySchoolManagement);

      // Register staff first
      await schoolManagement.connect(owner).createStaff(
        "Jane Doe",
        "Female",
        1,
        "Admin",
        staff.address
      );

      // Register student by staff
      await schoolManagement.connect(staff).registerStudent(
        "Alice",
        1,
        "Grade 1",
        10,
        student.address,
        0 // feeStatus.noPayment
      );

      const studentData = await schoolManagement.studentList(1);
      expect(studentData._name).to.equal("Alice");
      expect(studentData._studentAddress).to.equal(student.address);
    });

    it("Should prevent duplicate student registration", async function () {
      const { schoolManagement, owner, student } = await loadFixture(deploySchoolManagement);

      await schoolManagement.connect(owner).registerStudent(
        "Alice",
        1,
        "Grade 1",
        10,
        student.address,
        0 // feeStatus.noPayment
      );

      await expect(
        schoolManagement.connect(owner).registerStudent(
          "Bob",
          1, // Same student ID
          "Grade 2",
          12,
          student.address,
          0
        )
      ).to.be.revertedWith("STUDENT ALREADY REGISTERED");
    });
  });

  // FEE PAYMENT
  describe("Fee Payment", function () {
    async function setupStudent() {
      const { schoolManagement, owner, student } = await loadFixture(deploySchoolManagement);

      await schoolManagement.connect(owner).registerStudent(
        "Alice",
        1,
        "Grade 1",
        10,
        student.address,
        0 // feeStatus.noPayment
      );

      return { schoolManagement, student };
    }

    it("Should allow a student to make a half payment", async function () {
      const { schoolManagement, student } = await loadFixture(setupStudent);

      await schoolManagement.connect(student).payFees(1, {
        value: hre.ethers.parseEther("0.001"), // Half payment
      });

      const studentData = await schoolManagement.studentList(1);
      expect(studentData._fee).to.equal(1); // feeStatus.halfPayment
    });

    it("Should allow a student to make a full payment after half payment", async function () {
      const { schoolManagement, student } = await loadFixture(setupStudent);

      await schoolManagement.connect(student).payFees(1, {
        value: hre.ethers.parseEther("0.001"), // First half payment
      });

      await schoolManagement.connect(student).payFees(1, {
        value: hre.ethers.parseEther("0.001"), // Second half payment
      });

      const studentData = await schoolManagement.studentList(1);
      expect(studentData._fee).to.equal(2); // feeStatus.fullPayment
    });

    it("Should prevent invalid fee payment", async function () {
      const { schoolManagement, student } = await loadFixture(setupStudent);

      await expect(
        schoolManagement.connect(student).payFees(1, {
          value: hre.ethers.parseEther("0.003"), // Overpayment
        })
      ).to.be.revertedWith("PAY HALF OR FULL PAYMENT");
    });
  });
});
