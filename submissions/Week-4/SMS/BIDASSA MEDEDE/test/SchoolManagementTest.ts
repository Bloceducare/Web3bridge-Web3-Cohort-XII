import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
  import hre, { ethers } from "hardhat";
  import { expect } from "chai";
  
  describe("SchoolManagementSystem", function () {
    const deploySchoolContract = async () => {
        const [owner, student1, student2, staff1] = await ethers.getSigners();
        const SchoolManagementSystem = await ethers.getContractFactory("SchoolManagementSystem");
        const school = await SchoolManagementSystem.deploy();
        return { school, owner, student1, student2, staff1 };
    };
  
    describe("Deployment", function () {
        it("Should set the owner correctly", async function () {
            const { school, owner } = await loadFixture(deploySchoolContract);
            expect(await school.owner()).to.equal(owner.address);
        });
    });
  
    describe("Student Management", function () {
        it("Should allow owner to add a student", async function () {
            const { school, owner, student1 } = await loadFixture(deploySchoolContract);
            await school.addStudent(1, "John Doe", student1.address, 20, "Computer Science");
            const student = await school.students(student1.address);
            expect(student.name).to.equal("John Doe");
        });
  
        it("Should not allow non-owner to add a student", async function () {
            const { school, student1, student2 } = await loadFixture(deploySchoolContract);
            await expect(
                school.connect(student1).addStudent(2, "Jane Doe", student2.address, 22, "Mathematics")
            ).to.be.revertedWith("NON AUTHORIZED !");
        });
    });
  
    describe("Fee Payment", function () {
        it("Should allow student to pay fees", async function () {
            const { school, student1 } = await loadFixture(deploySchoolContract);
            await school.addStudent(1, "John Doe", student1.address, 20, "Computer Science");
            await school.connect(student1).payFees({ value: ethers.parseEther("1") });
            const [feesPaid, feesCleared] = await school.connect(student1).getFeeStatus();
            expect(feesPaid).to.equal(ethers.parseEther("1"));
            expect(feesCleared).to.equal(true);
        });
    });
  
    describe("Attendance", function () {
        it("Should allow staff to sign attendance", async function () {
            const { school, student1, staff1 } = await loadFixture(deploySchoolContract);
            await school.addStudent(1, "John Doe", student1.address, 20, "Computer Science");
            await school.addStaff(1, "Prof. Smith", staff1.address, 0, "Physics");
            await school.connect(staff1).signeAttendance(student1.address, 20240209);
            const student = await school.students(student1.address);
            expect(student.attendanceCount).to.equal(1);
        });
    });
  });