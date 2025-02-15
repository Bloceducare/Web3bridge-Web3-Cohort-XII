const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SchoolManagement Contract", function () {
    let SchoolManagement, school, owner, teacher, student;

    beforeEach(async function () {
        [owner, teacher, student] = await ethers.getSigners();
        await school.deployed();
    });

    it("Should set the owner correctly", async function () {
        expect(await school.owner()).to.equal(owner.address);
    });

    it("Should add a teacher", async function () {
        await expect(school.addTeacher(teacher.address, "John Doe", 40, "Math", 0))
            .to.emit(school, "TeacherAdded")
            .withArgs(teacher.address, "John Doe");
        
        const teacherDetails = await school.teachers(teacher.address);
        expect(teacherDetails.name).to.equal("John Doe");
        expect(teacherDetails.age).to.equal(40);
        expect(teacherDetails.classAssigned).to.equal("Math");
    });

    it("Should add a student", async function () {
        await school.addTeacher(teacher.address, "John Doe", 40, "Math", 0);
        await expect(school.connect(teacher).addStudent(student.address, "Alice", 18, "Math", 1))
            .to.emit(school, "studentAdded")
            .withArgs(student.address, "Alice");
        
        const studentDetails = await school.students(student.address);
        expect(studentDetails.name).to.equal("Alice");
        expect(studentDetails.age).to.equal(18);
        expect(studentDetails.classEnrolled).to.equal("Math");
    });

    it("Should allow the owner to set class fees", async function () {
        await school.setClassFee("Math", ethers.parseEther("0.1"));
        expect(await school.classFees("Math")).to.equal(ethers.parseEther("0.1"));
    });

    it("Should allow a student to pay fees", async function () {
        await school.addTeacher(teacher.address, "John Doe", 40, "Math", 0);
        await school.connect(teacher).addStudent(student.address, "Alice", 18, "Math", 1);
        await school.setClassFee("Math", ethers.parseEther("0.1"));

        await expect(school.connect(student).paySchoolFees({ value: ethers.parseEther("0.1") }))
            .to.emit(school, "FeePaid")
            .withArgs(student.address, ethers.parseEther("0.1"));

        expect(await school.checkFeeStatus(student.address)).to.equal(true);
    });
});
