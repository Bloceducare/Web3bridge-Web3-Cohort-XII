import { expect } from "chai";
import hre from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

async function deploySMSFixture() {
    const SMS = await hre.ethers.getContractFactory("SMS");
    const [owner, staff1, student1] = await hre.ethers.getSigners();
    const smsContract = await SMS.deploy();
    // await smsContract.deployed();
    return { smsContract, owner, staff1, student1 };
}

describe("School Management System (SMS) Test", () => {
    describe("Staff Registration", () => {
        it("should allow the principal to register a staff member", async () => {
            const { smsContract, owner, staff1 } = await loadFixture(deploySMSFixture);

            await smsContract.connect(owner).registerStaff(
                "John Doe", "Teacher", "Male", 1, staff1.address
            );

            const registeredStaff = await smsContract.idToStaff(1);
            expect(registeredStaff.name).to.equal("John Doe");
            expect(registeredStaff.isRegistered).to.be.true;
        });

        it("should prevent duplicate staff registration", async () => {
            const { smsContract, owner, staff1 } = await loadFixture(deploySMSFixture);

            await smsContract.connect(owner).registerStaff(
                "John Doe", "Teacher", "Male", 1, staff1.address
            );

            await expect(
                smsContract.connect(owner).registerStaff(
                    "John Doe", "Teacher", "Male", 1, staff1.address
                )
            ).to.be.revertedWith("staff already registered");
        });

        it("should only allow the principal to register staff", async () => {
            const { smsContract, staff1 } = await loadFixture(deploySMSFixture);

            await expect(
                smsContract.connect(staff1).registerStaff(
                    "John Doe", "Teacher", "Male", 1, staff1.address
                )
            ).to.be.revertedWith("Not the Principal");
        });
    });

    describe("Student Registration", () => {
        it("should allow staff or principal to register a student", async () => {
            const { smsContract, owner, staff1, student1 } = await loadFixture(deploySMSFixture);

            await smsContract.connect(owner).registerStaff(
                "John Doe", "Teacher", "Male", 1, staff1.address
            );

            await smsContract.connect(staff1).registerStudent(
                "Jane Doe", "Grade 5", "Female", 101, 20100101, 0, student1.address
            );

            const registeredStudent = await smsContract.idToStudent(101);
            expect(registeredStudent.name).to.equal("Jane Doe");
            expect(registeredStudent.isRegistered).to.be.true;
        });

        it("should prevent duplicate student registration", async () => {
            const { smsContract, owner, staff1, student1 } = await loadFixture(deploySMSFixture);

            await smsContract.connect(owner).registerStaff(
                "John Doe", "Teacher", "Male", 1, staff1.address
            );

            await smsContract.connect(staff1).registerStudent(
                "Jane Doe", "Grade 5", "Female", 101, 20100101, 0, student1.address
            );

            await expect(
                smsContract.connect(staff1).registerStudent(
                    "Jane Doe", "Grade 5", "Female", 101, 20100101, 0, student1.address
                )
            ).to.be.revertedWith("student already registered");
        });

        it("should only allow staff or principal to register students", async () => {
            const { smsContract, student1 } = await loadFixture(deploySMSFixture);

            await expect(
                smsContract.connect(student1).registerStudent(
                    "Jane Doe", "Grade 5", "Female", 101, 20100101, 0, student1.address
                )
            ).to.be.revertedWith("Only the principal and staff can register student");
        });
    });

    describe("Fee Payment", () => {
        it("should allow a student to pay half of the school fees", async () => {
            const { smsContract, owner, staff1, student1 } = await loadFixture(deploySMSFixture);

            await smsContract.connect(owner).registerStaff(
                "John Doe", "Teacher", "Male", 1, staff1.address
            );

            await smsContract.connect(staff1).registerStudent(
                "Jane Doe", "Grade 5", "Female", 101, 20100101, 0, student1.address
            );

            const halfPayment = hre.ethers.parseEther("0.01");
            await smsContract.connect(student1).paySchoolFees(101, { value: halfPayment });

            const student = await smsContract.idToStudent(101);
            expect(student.fee).to.equal(1); // halfPaid
        });

        it("should allow a student to pay full school fees", async () => {
            const { smsContract, owner, staff1, student1 } = await loadFixture(deploySMSFixture);

            await smsContract.connect(owner).registerStaff(
                "John Doe", "Teacher", "Male", 1, staff1.address
            );

            await smsContract.connect(staff1).registerStudent(
                "Jane Doe", "Grade 5", "Female", 101, 20100101, 0, student1.address
            );

            const fullPayment = hre.ethers.parseEther("0.02");
            await smsContract.connect(student1).paySchoolFees(101, { value: fullPayment });

            const student = await smsContract.idToStudent(101);
            expect(student.fee).to.equal(2); // fullPaid
        });

        it("should prevent invalid fee payments", async () => {
            const { smsContract, owner, staff1, student1 } = await loadFixture(deploySMSFixture);

            await smsContract.connect(owner).registerStaff(
                "John Doe", "Teacher", "Male", 1, staff1.address
            );

            await smsContract.connect(staff1).registerStudent(
                "Jane Doe", "Grade 5", "Female", 101, 20100101, 0, student1.address
            );

            const invalidPayment = hre.ethers.parseEther("0.005");
            await expect(
                smsContract.connect(student1).paySchoolFees(101, { value: invalidPayment })
            ).to.be.revertedWith("you must pay part or full payment");
        });
    });
});