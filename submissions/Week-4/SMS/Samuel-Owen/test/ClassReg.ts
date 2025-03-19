import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer } from "ethers";


describe("ClassRegistration", function () {
    let contract: ClassRegistration;
    let admin: Signer, staff: Signer, student1: Signer, student2: Signer;
    
    beforeEach(async function () {
        [admin, staff, student1, student2] = await ethers.getSigners();
        const ClassRegistrationFactory = await ethers.getContractFactory("ClassRegistration");
        contract = (await ClassRegistrationFactory.deploy()) as ClassRegistration;
        await contract.deployed();
    });

    it("Should set the admin correctly", async function () {
        expect(await contract.admin()).to.equal(await admin.getAddress());
    });

    it("Should allow admin to add staff", async function () {
        await contract.addStaff(await staff.getAddress());
        expect(await contract.isStaff(await staff.getAddress())).to.equal(true);
    });

    it("Should not allow non-admin to add staff", async function () {
        await expect(contract.connect(staff).addStaff(await staff.getAddress())).to.be.revertedWith("Only admin can open this!");
    });

    it("Should allow staff or admin to register a student", async function () {
        await contract.addStaff(await staff.getAddress());
        await contract.connect(staff).registerStudent(1, "Alice");
        const student = await contract.getStudentById(1);
        expect(student[0]).to.equal("Alice");
    });

    it("Should not allow non-staff/non-admin to register a student", async function () {
        await expect(contract.connect(student1).registerStudent(2, "Bob"))
            .to.be.revertedWith("Only admin or staff can open");
    });

    it("Should allow admin to remove a student", async function () {
        await contract.addStaff(await staff.getAddress());
        await contract.connect(staff).registerStudent(3, "Charlie");
        await contract.removeStudent(3);
        await expect(contract.getStudentById(3)).to.be.revertedWith("Student not found");
    });

    it("Should allow a student to pay fees", async function () {
        await contract.addStaff(await staff.getAddress());
        await contract.connect(staff).registerStudent(4, "David");
        await contract.connect(student1).paySchoolFees(4, { value: ethers.utils.parseEther("1.0") });
        const student = await contract.getStudentById(4);
        expect(student[1]).to.equal(ethers.utils.parseEther("1.0"));
    });

    it("Should not allow paying fees for an unregistered student", async function () {
        await expect(contract.connect(student1).paySchoolFees(5, { value: ethers.utils.parseEther("1.0") }))
            .to.be.revertedWith("Student not found");
    });
});
