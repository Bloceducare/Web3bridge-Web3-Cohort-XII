import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe('School Management System', function () {
    async function deploySchoolManagement() {
        const [owner, address1, address2, address3, address4, address5, address6] = await hre.ethers.getSigners();

        const SchoolManagement = await hre.ethers.getContractFactory("SchoolManagement");

        const schoolManagement = await SchoolManagement.deploy();

        return { owner, address1, address2, address3, address4, address5, address6, schoolManagement };
    }

    describe('Deployment', function () {
        it("should deploy successfully with owner as principal", async function () {
            const { owner, schoolManagement } = await loadFixture(deploySchoolManagement);
            expect(owner.address).to.equal(await schoolManagement.principal());
        });
    });

    describe('Set Tuition Fee', function () {
        it('should revert when not called by principal', async function () {
            const { schoolManagement, address1 } = await loadFixture(deploySchoolManagement);
            await expect(schoolManagement.connect(address1).setTuitionFee(1e8)).to.be.revertedWith('Access restricted to principal');
        });

        it('should allow the principal to set tuition fee', async function () {
            const { schoolManagement } = await loadFixture(deploySchoolManagement);
            await schoolManagement.setTuitionFee(1e9);
            expect(await schoolManagement.tuitionFee()).to.equal(1e9);
        });
    });

    describe('Teacher Management', function () {
        it('should allow principal to add a teacher', async function () {
            const { schoolManagement, address1 } = await loadFixture(deploySchoolManagement);
            await schoolManagement.addTeacher(address1.address, "Nnenna Okoye", 15, 1);
            const teacher = await schoolManagement.getTeacher(address1.address);
            expect(teacher.name).to.equal("Nnenna Okoye");
        });

        it('should not allow adding the same teacher twice', async function () {
            const { schoolManagement, address1 } = await loadFixture(deploySchoolManagement);
            await schoolManagement.addTeacher(address1.address, "Nnenna Okoye", 15, 1);
            await expect(schoolManagement.addTeacher(address1.address, "Nnenna Okoye", 15, 1)).to.be.revertedWith("Teacher already exists");
        });

        it('should allow the principal to remove a teacher', async function () {
            const { schoolManagement, address1 } = await loadFixture(deploySchoolManagement);
            await schoolManagement.addTeacher(address1.address, "Nnenna Okoye", 15, 1);
            await schoolManagement.removeTeacher(address1.address);
            const teacher = await schoolManagement.getTeacher(address1.address);
            expect(teacher.name).to.equal("");
        });
    });

    describe('Student Management', function () {
        it('should allow teachers and principal to add a student', async function () {
            const { schoolManagement, owner, address1, address2 } = await loadFixture(deploySchoolManagement);
            await schoolManagement.addTeacher(address1.address, "Nnenna", 15, 1);
            await schoolManagement.connect(address1).addStudent(address2.address, "Chisom", 9, 1);
            const student = await schoolManagement.getStudent(address2.address);
            expect(student.name).to.equal("Chisom");
        });

        it('should not allow adding the same student twice', async function () {
            const { schoolManagement, owner, address1, address2 } = await loadFixture(deploySchoolManagement);
            await schoolManagement.addStudent(address1.address, "Chisom", 9, 1);
            await expect(schoolManagement.addStudent(address1.address, "Chisom", 9, 1)).to.be.revertedWith("Student already exists");
        });

        it('should allow teachers and principal to remove a student', async function () {
            const { schoolManagement, address1 } = await loadFixture(deploySchoolManagement);
            await schoolManagement.addStudent(address1.address, "Chisom", 9, 1);
            await schoolManagement.removeStudent(address1.address);
            const student = await schoolManagement.getStudent(address1.address);
            expect(student.name).to.equal("");
        });
    });

    describe('Tuition Fee Payment', function () {
        it('should allow a student to pay tuition fee', async function () {
            const { schoolManagement, address1 } = await loadFixture(deploySchoolManagement);
            await schoolManagement.addStudent(address1.address, "Chisom", 9, 1);
            await schoolManagement.setTuitionFee(1e9);
            await schoolManagement.connect(address1).payTuitionFee({ value: 1e9 });
            const student = await schoolManagement.getStudent(address1.address);
            expect(student.paymentStatus).to.equal(1);
        });

        it('should revert if incorrect tuition fee is paid', async function () {
            const { schoolManagement, address1 } = await loadFixture(deploySchoolManagement);
            await schoolManagement.addStudent(address1.address, "Chisom", 9, 1);
            await schoolManagement.setTuitionFee(1e9);
            await expect(schoolManagement.connect(address1).payTuitionFee({ value: 5e8 })).to.be.revertedWith("Incorrect amount");
        });
    });


    describe('Withdraw Funds', function () {
      it('should allow the principal to withdraw funds', async function () {
          const { schoolManagement, owner, address1 } = await loadFixture(deploySchoolManagement);
          await schoolManagement.addStudent(address1.address, "Nnenna Okoye", 15, 1);
          await schoolManagement.setTuitionFee(1e9);
          await schoolManagement.connect(address1).payTuitionFee({ value: 1e9 });
          const initialBalance = await hre.ethers.provider.getBalance(owner.address);
          const tx = await schoolManagement.withdraw();
          const receipt = await tx.wait(); 
          console.log(receipt);
          const gasUsed = receipt.gasUsed * receipt.gasPrice; 
            const finalBalance = await hre.ethers.provider.getBalance(owner.address);
            expect(finalBalance).to.be.gte(initialBalance - gasUsed);
      });
  });
  
});
