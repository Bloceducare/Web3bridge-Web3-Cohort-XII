import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import hre from 'hardhat'
import { expect } from 'chai'


describe('School System', () => {
    const deploySchoolManagement = async () => {
        const [owner, address1, address2] = await hre.ethers.getSigners();
        const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000';
        const school = await hre.ethers.getContractFactory('SchoolManagement');
        const deploySchool = await school.deploy();
        return { deploySchool, owner, address1, address2, ADDRESS_ZERO}
    }

    describe('Deployment', () => {
        it('Should be deployed by the owner', async () => {
            let {deploySchool, owner} = await loadFixture(deploySchoolManagement);
            expect(owner.address).to.equal(await deploySchool.owner());
        })

        it('Should not be address zero', async () => {
            let {deploySchool, ADDRESS_ZERO} = await loadFixture(deploySchoolManagement);
            expect(deploySchool.target).to.not.be.equal(ADDRESS_ZERO);
        })
    })

    describe('Add Teachers', () => {
        it('It Should add a teacher successfully', async () => {
            let {deploySchool, owner} = await loadFixture(deploySchoolManagement);
            const name = 'Kofi';
            const id = 1;
            await deploySchool.connect(owner).addTeacher(id, name);
            let Teachers = await deploySchool.teachers(1);
            expect(Teachers.teacherId).to.equal(id);
            expect(Teachers.teacherName).to.be.equal(name)
        })

        it('Should only allow the owner to add a teacher', async () => {
            let { deploySchool, address1 } = await loadFixture(deploySchoolManagement);
            const teacherId = 2;
            const teacherName = 'Manoah';
            await expect(
                deploySchool.connect(address1).addTeacher(teacherId, teacherName)
            ).to.be.revertedWith("You must be the owner");
        })
    })

    describe('Add Students', () => {
        it('Should add a student successfully', async () => {
            let {deploySchool, owner} = await loadFixture(deploySchoolManagement);
            const studentId = 1;
            const studentName = "Wizkid";
            const gender = "Male";
            
            await deploySchool.connect(owner).addStudent(studentId, studentName, gender);
            
            const student = await deploySchool.students(1);
            expect(student.studentId).to.equal(studentId);
            expect(student.studentName).to.equal(studentName);
            expect(student.gender).to.equal(gender);
            expect(student.paid).to.equal(false);
        });

        it('Should only allow owner to add students', async () => {
            let {deploySchool, address1} = await loadFixture(deploySchoolManagement);
            const studentId = 1;
            const studentName = "John wick";
            const gender = "Male";
            
            await expect(
                deploySchool.connect(address1).addStudent(studentId, studentName, gender)
            ).to.be.revertedWith("You must be the owner");
        });
    });

    describe('Pay Fees', () => {
        it('Should allow student to pay fees', async () => {
            let {deploySchool, owner, address1} = await loadFixture(deploySchoolManagement);
            
            // First add a student
            await deploySchool.connect(owner).addStudent(1, "ebuka", "Male");
            
            // Pay fees
            const studentId = 1; 
            const schoolFees = await deploySchool.feeAmount();
            const newFees = await deploySchool.connect(address1).payFees(1, {value: schoolFees})
            
            // Verify total fees collected
            expect(newFees).to.equal(schoolFees);
        });

        it('Should not allow paying fees twice', async () => {
            let {deploySchool, owner, address1} = await loadFixture(deploySchoolManagement);
            
            // Add student and pay fees first time
            await deploySchool.connect(owner).addStudent(1, "elon musk", "Male");
            const feeAmount = await deploySchool.feeAmount();
            await deploySchool.connect(address1).payFees(1, { value: feeAmount });
            
            // Try to pay fees again
            expect(
                deploySchool.connect(address1).payFees(1, { value: feeAmount })
            ).to.be.revertedWith("You have paid fees");
        });

        it('Should not allow paying incorrect fee amount', async () => {
            let {deploySchool, owner, address1} = await loadFixture(deploySchoolManagement);
            
            await deploySchool.connect(owner).addStudent(1, "Kofi", "Male");
            
            expect(
                deploySchool.connect(address1).payFees(1, { value: hre.ethers.parseEther("0.5") })
            ).to.be.revertedWith("fees must be 1 ether");
        });
    });

    describe('Withdraw', () => {
        it('Should allow owner to withdraw collected fees', async () => {
            let {deploySchool, owner, address1} = await loadFixture(deploySchoolManagement);
            
            // Add student and pay fees
            await deploySchool.connect(owner).addStudent(1, "Kofi", "Male");
            const feeAmount = await deploySchool.feeAmount();
            await deploySchool.connect(address1).payFees(1, { value: feeAmount });
            
            // Check initial balance
            const initialBalance = await hre.ethers.provider.getBalance(owner.address);
            
            // Withdraw fees
            await deploySchool.connect(owner).withdraw();
            
            // Check final balance
            const finalBalance = await hre.ethers.provider.getBalance(owner.address);
            expect(finalBalance).to.be.greaterThan(initialBalance);
            
            // Verify totalFeesCollected is reset
            expect(await deploySchool.totalFeesCollected()).to.equal(0);
        });

        it('Should not allow non-owner to withdraw', async () => {
            let {deploySchool, owner, address1} = await loadFixture(deploySchoolManagement);
            
            // Add student and pay fees
            await deploySchool.connect(owner).addStudent(1, "Jack", "Male");
            const feeAmount = await deploySchool.feeAmount();
            await deploySchool.connect(address1).payFees(1, { value: feeAmount });
            
            // Try to withdraw as non-owner
            expect(
                deploySchool.connect(address1).withdraw()
            ).to.be.revertedWith("You must be the owner");
        });

        it('Should not allow withdrawal when no fees are collected', async () => {
            let {deploySchool, owner} = await loadFixture(deploySchoolManagement);
            
            expect(
                deploySchool.connect(owner).withdraw()
            ).to.be.revertedWith("No Money in the aza");
        });
    });
})