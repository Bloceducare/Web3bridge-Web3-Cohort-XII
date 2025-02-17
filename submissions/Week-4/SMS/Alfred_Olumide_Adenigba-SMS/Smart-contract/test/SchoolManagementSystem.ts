import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import hre, { ethers } from "hardhat";
import { expect } from "chai";

describe('SchoolManagementSystem test', () => {
    
    const deploySMSContract = async  () => {

        const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'

        const [owner, staff, student1, student2, parent, stranger] = await hre.ethers.getSigners();

        const sms = await hre.ethers.getContractFactory("SchoolManagementSystem");

        const deploySMS = await sms.deploy();

        return {
            deploySMS,
            owner,
            staff,
            student1,
            student2,
            parent,
            stranger,
            ADDRESS_ZERO
        }
    }

    describe("Deployment", () => {

        it('should be deployed by owner', async() => {
            let {deploySMS, owner} = await loadFixture(deploySMSContract);

            const runner = deploySMS.runner as HardhatEthersSigner;

            expect(runner.address).to.equal(owner.address);
        })

        it('should not be address zero', async() => {
            let {deploySMS, ADDRESS_ZERO} = await loadFixture(deploySMSContract);

            expect(deploySMS.target).to.not.be.equal(ADDRESS_ZERO);
        }) 
    })

    describe('Principal Powers', () => { 
        it('should allow only principal to set tuition fee', async () => {
            let {deploySMS, owner, staff} = await loadFixture(deploySMSContract);

            await expect(deploySMS.connect(staff).setTuitionFee(ethers.parseEther("0.01"))).to.be.revertedWith('Only Principal Allowed');

            await deploySMS.connect(owner).setTuitionFee(ethers.parseEther("0.01"));

            expect(await deploySMS.tuitionFee()).to.equal(ethers.parseEther("0.01"));
        });

        it('should allow principal to add and remove staff', async () => {
            let { deploySMS, owner, staff } = await loadFixture(deploySMSContract);

            await deploySMS.connect(owner).addStaff(staff.address);
            expect(await deploySMS.staff(staff.address)).to.be.true;

            await deploySMS.connect(owner).removeStaff(staff.address);
            expect(await deploySMS.staff(staff.address)).to.be.false;
        });

        it('should not allow staff or other people to add and remove staff', async () => {
            let { deploySMS, staff, parent, stranger } = await loadFixture(deploySMSContract);

            await expect(deploySMS.connect(staff).addStaff(stranger.address)).to.be.revertedWith('Only Principal Allowed');

            await expect(deploySMS.connect(parent).addStaff(staff.address)).to.be.revertedWith('Only Principal Allowed');
        });

        it('should allow principal to remove student', async () => {

            let { deploySMS, owner, staff, student1 } = await loadFixture(deploySMSContract);

            await deploySMS.connect(owner).addStaff(staff.address);
            await deploySMS.connect(owner).setTuitionFee(ethers.parseEther("0.01"));
            await deploySMS.connect(staff).registerStudent("Olumide", 22, student1.address);
            // console.log("New student", await deploySMS.connect(owner).getStudent(1));
            await expect(deploySMS.connect(staff).removeStudent(1)).to.be.revertedWith('Only Principal Allowed');
            await deploySMS.connect(owner).removeStudent(1);

            await expect(deploySMS.connect(owner).getStudent(1)).to.be.revertedWith('Student not found');
       });

       it("should allow principal to withdraw funds", async () => {
        let { deploySMS, owner, student1 } = await loadFixture(deploySMSContract);

        await deploySMS.connect(owner).setTuitionFee(ethers.parseEther("0.1"));

        await deploySMS.connect(owner).registerStudent("Olumide", 22, student1.address);
        await deploySMS.connect(student1).payTuition(1, { value:(ethers.parseEther("0.1"))});

        await expect(deploySMS.connect(owner).withdrawFunds(ethers.parseEther("0.1")))
            .to.emit(deploySMS, "FundsWithdrawn")
            .withArgs(owner.address, ethers.parseEther("0.1"), 0);
        });

        it('should not allow staff or other people to withdraw funds', async () => {
            let { deploySMS, owner, staff, student1 } = await loadFixture(deploySMSContract);

            await deploySMS.connect(owner).setTuitionFee(ethers.parseEther("0.1"));
            await deploySMS.connect(owner).registerStudent("Olumide", 22, student1.address);
            await deploySMS.connect(student1).payTuition(1, { value:(ethers.parseEther("0.1"))});

            await expect(deploySMS.connect(staff).withdrawFunds(ethers.parseEther("0.1"))).to.be.revertedWith('Only Principal Allowed');
        });

        it('should allow only principal pay staff salary', async () => {

            let { deploySMS, owner, staff, student1 } = await loadFixture(deploySMSContract);

            await deploySMS.connect(owner).addStaff(staff.address);

            await deploySMS.connect(owner).setTuitionFee(ethers.parseEther("0.2"));
            await deploySMS.connect(staff).registerStudent("Olumide", 22, student1.address);
            await deploySMS.connect(student1).payTuition(1, { value:(ethers.parseEther("0.2"))});

            const balanceBefore = await ethers.provider.getBalance(staff.address);

            await deploySMS.connect(owner).paySalary(staff.address, ethers.parseEther("0.1"));
        
            const balanceAfter = await ethers.provider.getBalance(staff.address);
        
            expect(balanceAfter - balanceBefore).to.greaterThanOrEqual(ethers.parseEther("0.1"));        
        });

        it('should not allow staff or other people pay staff salary', async () => {

            let { deploySMS, owner, staff, student1 } = await loadFixture(deploySMSContract);

            await deploySMS.connect(owner).addStaff(staff.address);

            await deploySMS.connect(owner).setTuitionFee(ethers.parseEther("0.2"));
            await deploySMS.connect(staff).registerStudent("Olumide", 22, student1.address);
            await deploySMS.connect(student1).payTuition(1, { value:(ethers.parseEther("0.2"))});

            await expect(deploySMS.connect(staff).paySalary(staff.address, ethers.parseEther("0.1"))).to.be.revertedWith('Only Principal Allowed');     
        });
    })

    describe('Staff Powers', () => {
        it('should allow staff to register students', async () => {
            let { deploySMS, owner, staff, student1, stranger } = await loadFixture(deploySMSContract);

            await deploySMS.connect(owner).addStaff(staff.address);
            await deploySMS.connect(owner).setTuitionFee(ethers.parseEther("0.01"));

            await expect(deploySMS.connect(student1).registerStudent("Olumide", 22, student1.address)).to.be.revertedWith('Not staff');

            await deploySMS.connect(staff).registerStudent("Olumide", 22, student1.address);
 
            const student = await deploySMS.connect(owner).getStudent(1);
            expect(student.isRegistered).to.be.true;
        });

        it('should only allow staff to register students with only valid address', async () => {
            let { deploySMS, owner, staff, student1, ADDRESS_ZERO } = await loadFixture(deploySMSContract);

            await deploySMS.connect(owner).addStaff(staff.address);
            await deploySMS.connect(owner).setTuitionFee(ethers.parseEther("0.01"));

            await expect(deploySMS.connect(staff).registerStudent("John Doe", 22, ADDRESS_ZERO)).to.be.revertedWith('Invalid address');
        });

        it('should not allow strangers or student to be able to register students', async () => {
            let { deploySMS, owner, staff, student1, stranger } = await loadFixture(deploySMSContract);

            await deploySMS.connect(owner).addStaff(staff.address);
            await deploySMS.connect(owner).setTuitionFee(ethers.parseEther("0.01"));

            await expect(deploySMS.connect(stranger).registerStudent("Olumide", 22, student1.address)).to.be.revertedWith('Not staff');

            await expect(deploySMS.connect(student1).registerStudent("Olumide", 22, student1.address)).to.be.revertedWith('Not staff');
        });

        it('should allow only staff to add courses', async () => {
            let { deploySMS, owner, staff, student1 } = await loadFixture(deploySMSContract);

            await deploySMS.connect(owner).addStaff(staff.address);

            await expect(deploySMS.connect(student1).addCourse("Sol 101")).to.be.revertedWith('Not staff');

            await deploySMS.connect(staff).addCourse('Sol 101');

            const course = await deploySMS.connect(owner).courses(1);
            expect(course.courseName).to.equal('Sol 101');
        });

        it('should not allow strangers or students to add courses', async () => {
            let { deploySMS, owner, staff, student1, stranger } = await loadFixture(deploySMSContract);

            await expect(deploySMS.connect(stranger).addCourse("Sol 101")).to.be.revertedWith('Not staff');

            await expect(deploySMS.connect(student1).addCourse("Sol 101")).to.be.revertedWith('Not staff');
        });      
    });

    describe('Student Powers', () => {
        it('should allow student to pay tuition', async () => {
            let { deploySMS, owner, staff, student1 } = await loadFixture(deploySMSContract);

            await deploySMS.connect(owner).addStaff(staff.address);
            await deploySMS.connect(owner).setTuitionFee(ethers.parseEther("0.01"));

            await expect(deploySMS.connect(student1).payTuition(1, {value: (ethers.parseEther("0.01"))})).to.be.revertedWith('Not registered');

            await deploySMS.connect(staff).registerStudent("Olumide", 22, student1.address);

            await deploySMS.connect(student1).payTuition(1, { value:(ethers.parseEther("0.01"))});

            const student = await deploySMS.connect(owner).getStudent(1);
            expect(student.hasPaidTuition).to.be.true;
        });

        it('should make sure student pay the correct tuition fee', async () => {
            let { deploySMS, owner, staff, student1 } = await loadFixture(deploySMSContract);
            
            await deploySMS.connect(owner).setTuitionFee(ethers.parseEther("0.01"));
            await deploySMS.connect(owner).addStaff(staff.address);
            
            await deploySMS.connect(staff).registerStudent("Olumide", 22, student1.address);

            await expect(deploySMS.connect(student1).payTuition(1, { value:(ethers.parseEther("0.02"))})).to.be.revertedWith('Incorrect amount');
        });


       it('should allow student to only be able register for courses after registration and paying tuition', async () => {
           let { deploySMS, owner, staff, student1 } = await loadFixture(deploySMSContract);

           await deploySMS.connect(owner).addStaff(staff.address);
           await deploySMS.connect(owner).setTuitionFee(80);           
           await deploySMS.connect(staff).addCourse('Sol 101');

           await expect(deploySMS.connect(student1).registerForCourse( 1, 1)).to.be.revertedWith('Student not registered');

           await deploySMS.connect(staff).registerStudent("Olumide", 22, student1.address);
           await deploySMS.connect(staff).addCourse('Sol 101');

           await expect(deploySMS.connect(student1).registerForCourse( 1, 1)).to.be.revertedWith('No tuition Paid');

           await deploySMS.connect(student1).payTuition(1, {value: 80});
           //console.log("New student", await deploySMS.connect(owner).getStudent(1));
           await deploySMS.connect(student1).registerForCourse(1, 1);

           expect(await deploySMS.studentCourses(1, 1)).to.be.true;
       });
    });
})