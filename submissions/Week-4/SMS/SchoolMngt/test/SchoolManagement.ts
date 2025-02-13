import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";

describe("SchoolManagementSystem", function () {
  async function deploySchoolSystemFixture() {
    const [owner, staff1, staff2, student1, student2] = await hre.ethers.getSigners();
    
    const SchoolManagementSystem = await hre.ethers.getContractFactory("SchoolManagementSystem");
    const schoolSystem = await SchoolManagementSystem.deploy();
    
    const schoolFees = hre.ethers.parseEther("0.05");

    return { schoolSystem, owner, staff1, staff2, student1, student2, schoolFees };
  }

  describe("Deployment", function () {
    it("Should set the right principal", async function () {
      const { schoolSystem, owner } = await loadFixture(deploySchoolSystemFixture);
      expect(await schoolSystem.principal()).to.equal(owner.address);
    });

    it("Should set the correct initial school fees", async function () {
      const { schoolSystem, schoolFees } = await loadFixture(deploySchoolSystemFixture);
      expect(await schoolSystem.schoolFees()).to.equal(schoolFees);
    });
  });

  describe("Staff Management", function () {
    it("Should allow principal to register staff", async function () {
      const { schoolSystem, staff1 } = await loadFixture(deploySchoolSystemFixture);
      
      await schoolSystem.registerStaff(staff1.address, "John Doe", "Mathematics");
      
      const staffDetails = await schoolSystem.getStaffDetails(staff1.address);
      expect(staffDetails.name).to.equal("John Doe");
      expect(staffDetails.subject).to.equal("Mathematics");
      expect(staffDetails.isRegistered).to.be.true;
    });

    it("Should emit StaffRegistered event", async function () {
      const { schoolSystem, staff1 } = await loadFixture(deploySchoolSystemFixture);
      
      await expect(schoolSystem.registerStaff(staff1.address, "John Doe", "Mathematics"))
        .to.emit(schoolSystem, "StaffRegistered")
        .withArgs(staff1.address, 1, "John Doe");
    });

    it("Should not allow non-principal to register staff", async function () {
      const { schoolSystem, staff1, staff2 } = await loadFixture(deploySchoolSystemFixture);
      
      await expect(
        schoolSystem.connect(staff1).registerStaff(staff2.address, "Jane Doe", "English")
      ).to.be.revertedWith("Only principal can call this function");
    });

    it("Should not allow registering staff twice", async function () {
      const { schoolSystem, staff1 } = await loadFixture(deploySchoolSystemFixture);
      
      await schoolSystem.registerStaff(staff1.address, "John Doe", "Mathematics");
      await expect(
        schoolSystem.registerStaff(staff1.address, "John Doe", "Physics")
      ).to.be.revertedWith("Staff already registered");
    });
  });

  describe("Student Management", function () {
    it("Should allow staff to register student", async function () {
      const { schoolSystem, staff1, student1 } = await loadFixture(deploySchoolSystemFixture);
      
      await schoolSystem.registerStaff(staff1.address, "John Doe", "Mathematics");
      await schoolSystem.connect(staff1).registerStudent(student1.address, "Alice", 10);
      
      const studentDetails = await schoolSystem.getStudentDetails(student1.address);
      expect(studentDetails.name).to.equal("Alice");
      expect(studentDetails.grade).to.equal(10);
      expect(studentDetails.isRegistered).to.be.true;
      expect(studentDetails.hasPaidFees).to.be.false;
    });

    it("Should emit StudentRegistered event", async function () {
      const { schoolSystem, staff1, student1 } = await loadFixture(deploySchoolSystemFixture);
      
      await schoolSystem.registerStaff(staff1.address, "John Doe", "Mathematics");
      await expect(schoolSystem.connect(staff1).registerStudent(student1.address, "Alice", 10))
        .to.emit(schoolSystem, "StudentRegistered")
        .withArgs(student1.address, 1, "Alice");
    });

    it("Should not allow non-staff to register student", async function () {
      const { schoolSystem, student1, student2 } = await loadFixture(deploySchoolSystemFixture);
      
      await expect(
        schoolSystem.connect(student2).registerStudent(student1.address, "Alice", 10)
      ).to.be.revertedWith("Only staff or principal can call this function");
    });

    it("Should not allow registering student twice", async function () {
      const { schoolSystem, staff1, student1 } = await loadFixture(deploySchoolSystemFixture);
      
      await schoolSystem.registerStaff(staff1.address, "John Doe", "Mathematics");
      await schoolSystem.connect(staff1).registerStudent(student1.address, "Alice", 10);
      await expect(
        schoolSystem.connect(staff1).registerStudent(student1.address, "Alice", 11)
      ).to.be.revertedWith("Student already registered");
    });
  });

  describe("Fee Management", function () {
    it("Should allow student to pay fees", async function () {
      const { schoolSystem, staff1, student1, schoolFees } = await loadFixture(deploySchoolSystemFixture);
      
      await schoolSystem.registerStaff(staff1.address, "John Doe", "Mathematics");
      await schoolSystem.connect(staff1).registerStudent(student1.address, "Alice", 10);
      
      await expect(
        schoolSystem.connect(student1).paySchoolFees({ value: schoolFees })
      ).to.emit(schoolSystem, "FeePaid")
        .withArgs(student1.address, schoolFees);

      const studentDetails = await schoolSystem.getStudentDetails(student1.address);
      expect(studentDetails.hasPaidFees).to.be.true;
    });

    it("Should not allow paying incorrect fee amount", async function () {
      const { schoolSystem, staff1, student1 } = await loadFixture(deploySchoolSystemFixture);
      
      await schoolSystem.registerStaff(staff1.address, "John Doe", "Mathematics");
      await schoolSystem.connect(staff1).registerStudent(student1.address, "Alice", 10);
      
      const incorrectFees = hre.ethers.parseEther("0.04");
      await expect(
        schoolSystem.connect(student1).paySchoolFees({ value: incorrectFees })
      ).to.be.revertedWith("Incorrect fee amount");
    });

    it("Should not allow paying fees twice", async function () {
      const { schoolSystem, staff1, student1, schoolFees } = await loadFixture(deploySchoolSystemFixture);
      
      await schoolSystem.registerStaff(staff1.address, "John Doe", "Mathematics");
      await schoolSystem.connect(staff1).registerStudent(student1.address, "Alice", 10);
      await schoolSystem.connect(student1).paySchoolFees({ value: schoolFees });
      
      await expect(
        schoolSystem.connect(student1).paySchoolFees({ value: schoolFees })
      ).to.be.revertedWith("Fees already paid");
    });
  });

  describe("Fund Management", function () {
    // it("Should allow principal to withdraw funds", async function () {
    //   const { schoolSystem, owner, staff1, student1, schoolFees } = await loadFixture(deploySchoolSystemFixture);
      
    //   await schoolSystem.registerStaff(staff1.address, "John Doe", "Mathematics");
    //   await schoolSystem.connect(staff1).registerStudent(student1.address, "Alice", 10);
    //   await schoolSystem.connect(student1).paySchoolFees({ value: schoolFees });

    //   const initialBalance = await hre.ethers.provider.getBalance(owner.address);
    //   const tx = await schoolSystem.withdrawFunds();
    //   const receipt = await tx.wait();
    //   const gasCost = receipt.gasUsed * tx.gasPrice;
      
    //   const finalBalance = await hre.ethers.provider.getBalance(owner.address);
    //   expect(finalBalance - initialBalance).to.equal(Number(schoolFees) - gasCost);
    // });

    it("Should not allow non-principal to withdraw funds", async function () {
      const { schoolSystem, staff1 } = await loadFixture(deploySchoolSystemFixture);
      
      await expect(
        schoolSystem.connect(staff1).withdrawFunds()
      ).to.be.revertedWith("Only principal can call this function");
    });
  });

  describe("View Functions", function () {
    it("Should correctly return student details by ID", async function () {
      const { schoolSystem, staff1, student1 } = await loadFixture(deploySchoolSystemFixture);
      
      await schoolSystem.registerStaff(staff1.address, "John Doe", "Mathematics");
      await schoolSystem.connect(staff1).registerStudent(student1.address, "Alice", 10);
      
      const [addr, name, grade, hasPaidFees] = await schoolSystem.getStudentById(1);
      expect(addr).to.equal(student1.address);
      expect(name).to.equal("Alice");
      expect(grade).to.equal(10);
      expect(hasPaidFees).to.be.false;
    });

    it("Should correctly return staff details by ID", async function () {
      const { schoolSystem, staff1 } = await loadFixture(deploySchoolSystemFixture);
      
      await schoolSystem.registerStaff(staff1.address, "John Doe", "Mathematics");
      
      const [addr, name, subject] = await schoolSystem.getStaffById(1);
      expect(addr).to.equal(staff1.address);
      expect(name).to.equal("John Doe");
      expect(subject).to.equal("Mathematics");
    });

    it("Should revert when querying non-existent student", async function () {
      const { schoolSystem } = await loadFixture(deploySchoolSystemFixture);
      
      await expect(
        schoolSystem.getStudentById(999)
      ).to.be.revertedWith("Student not found");
    });

    it("Should revert when querying non-existent staff", async function () {
      const { schoolSystem } = await loadFixture(deploySchoolSystemFixture);
      
      await expect(
        schoolSystem.getStaffById(999)
      ).to.be.revertedWith("Staff not found");
    });
  });
});