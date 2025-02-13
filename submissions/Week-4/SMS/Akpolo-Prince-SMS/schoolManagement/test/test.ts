const { time, loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SchoolManagement", function () {
    const deploySchoolContract = async () => {
        const [principal, teacher, accountant, student1, student2] = await ethers.getSigners();
        const SchoolManagement = await ethers.getContractFactory("SchoolManagement");
        const schoolContract = await SchoolManagement.deploy();
        return { schoolContract, principal, teacher, accountant, student1, student2 };
    };

    describe("Deployment", function () {
        it("should be deployed by the principal", async function () {
            const { schoolContract, principal } = await loadFixture(deploySchoolContract);
            const deployedPrincipal = await schoolContract.principal();
            expect(deployedPrincipal).to.equal(principal.address);
        });

        it("should not be deployed at address zero", async function () {
            const { schoolContract } = await loadFixture(deploySchoolContract);
            const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";
            expect(schoolContract.address).to.not.equal(ADDRESS_ZERO);
        });
    });

    describe("Staff Registration", function () {
        it("should allow the principal to register a staff member", async function () {
            const { schoolContract, principal, teacher } = await loadFixture(deploySchoolContract);

            const role = 0; // Teacher
            const name = "John Doe";
            const gender = 0; // Male
            const age = 35;

            await schoolContract.connect(principal).registerStaff(role, name, gender, teacher.address, age);

            const staff = await schoolContract.staffList(1);
            expect(staff.role).to.equal(role);
            expect(staff.name).to.equal(name);
            expect(staff.gender).to.equal(gender);
            expect(staff.age).to.equal(age);
            expect(staff.isActive).to.be.true;
            expect(await schoolContract.isStaff(teacher.address)).to.be.true;
        });

        it("should reject staff registration from non-principal accounts", async function () {
            const { schoolContract, teacher } = await loadFixture(deploySchoolContract);

            const role = 0; // Teacher
            const name = "John Doe";
            const gender = 0; // Male
            const age = 35;

            await expect(
                schoolContract.connect(teacher).registerStaff(role, name, gender, teacher.address, age)
            ).to.be.revertedWith("principal only");
        });
    });

    describe("Student Registration", function () {
        it("should allow the principal or staff to register a student", async function () {
            const { schoolContract, principal, teacher, student1 } = await loadFixture(deploySchoolContract);

            // Register a staff member first
            await schoolContract.connect(principal).registerStaff(0, "Teacher Name", 0, teacher.address, 40);

            // Register a student using the teacher account
            const className = "Class A";
            const name = "Alice";
            const gender = 1; // Female
            const age = 12;

            await schoolContract.connect(teacher).registerStudent(className, name, gender, student1.address, age);

            const student = await schoolContract.studentList(student1.address);
            expect(student.class).to.equal(className);
            expect(student.name).to.equal(name);
            expect(student.gender).to.equal(gender);
            expect(student.age).to.equal(age);
            expect(student.isActive).to.be.true;
            expect(student.hasPaid).to.be.false;
        });

        it("should reject student registration from unauthorized accounts", async function () {
            const { schoolContract, student1 } = await loadFixture(deploySchoolContract);

            const className = "Class A";
            const name = "Alice";
            const gender = 1; // Female
            const age = 12;

            await expect(
                schoolContract.connect(student1).registerStudent(className, name, gender, student1.address, age)
            ).to.be.revertedWith("Only principal or staff can perform this action");
        });
    });

    describe("Student Payment", function () {
        it("should allow a student to pay school fees", async function () {
            const { schoolContract, principal, teacher, student1 } = await loadFixture(deploySchoolContract);

            // Register a staff member first
            await schoolContract.connect(principal).registerStaff(0, "Teacher Name", 0, teacher.address, 40);

            // Register a student using the teacher account
            const className = "Class A";
            const name = "Alice";
            const gender = 1; // Female
            const age = 12;

            await schoolContract.connect(teacher).registerStudent(className, name, gender, student1.address, age);

            // Pay school fees
            const feeAmount = await schoolContract.schoolFeesAmount();
            await schoolContract.connect(student1).studentPayment({ value: feeAmount });

            const student = await schoolContract.studentList(student1.address);
            expect(student.hasPaid).to.be.true;
        });

        it("should reject payment if the student has already paid", async function () {
            const { schoolContract, principal, teacher, student1 } = await loadFixture(deploySchoolContract);

            // Register a staff member first
            await schoolContract.connect(principal).registerStaff(0, "Teacher Name", 0, teacher.address, 40);

            // Register a student using the teacher account
            const className = "Class A";
            const name = "Alice";
            const gender = 1; // Female
            const age = 12;

            await schoolContract.connect(teacher).registerStudent(className, name, gender, student1.address, age);

            // Pay school fees
            const feeAmount = await schoolContract.schoolFeesAmount();
            await schoolContract.connect(student1).studentPayment({ value: feeAmount });

            // Try to pay again
            await expect(
                schoolContract.connect(student1).studentPayment({ value: feeAmount })
            ).to.be.revertedWith("Student has already paid");
        });
    });

    describe("Updating School Fees", function () {
        it("should allow the principal to update school fees", async function () {
            const { schoolContract, principal } = await loadFixture(deploySchoolContract);

            const newFee = ethers.parseEther("2"); // Use ethers.parseEther if available
            // If parseEther is not available, use:
            // const newFee = ethers.BigNumber.from("2000000000000000000");

            await schoolContract.connect(principal).updateSchoolFees(newFee);

            expect(await schoolContract.schoolFeesAmount()).to.equal(newFee);
        });

        it("should reject fee updates from non-principal accounts", async function () {
            const { schoolContract, teacher } = await loadFixture(deploySchoolContract);

            const newFee = ethers.parseEther("2"); // Use ethers.parseEther if available
            // If parseEther is not available, use:
            // const newFee = ethers.BigNumber.from("2000000000000000000");

            await expect(
                schoolContract.connect(teacher).updateSchoolFees(newFee)
            ).to.be.revertedWith("principal only");
        });
    });

    describe("Verification of Student Payments", function () {
        it("should verify if a student has paid their fees", async function () {
            const { schoolContract, principal, teacher, student1 } = await loadFixture(deploySchoolContract);

            // Register a staff member first
            await schoolContract.connect(principal).registerStaff(0, "Teacher Name", 0, teacher.address, 40);

            // Register a student using the teacher account
            const className = "Class A";
            const name = "Alice";
            const gender = 1; // Female
            const age = 12;

            await schoolContract.connect(teacher).registerStudent(className, name, gender, student1.address, age);

            // Verify payment before paying
            expect(await schoolContract.hasStudentPaid(student1.address)).to.be.false;

            // Pay school fees
            const feeAmount = await schoolContract.schoolFeesAmount();
            await schoolContract.connect(student1).studentPayment({ value: feeAmount });

            // Verify payment after paying
            expect(await schoolContract.hasStudentPaid(student1.address)).to.be.true;
        });
    });
});