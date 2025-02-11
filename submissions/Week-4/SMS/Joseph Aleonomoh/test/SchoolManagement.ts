import { time, loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { expect } from 'chai';
import hre from 'hardhat';

describe('Schoolmanagement', () => {
    async function deploySchoolManagementFixture() {
        const [owner, address1, address2, address3] = await hre.ethers.getSigners();
        const schoolManagement = await hre.ethers.getContractFactory('SchoolManagement');
        const feeAmount = 1e9;
        const school = await schoolManagement.deploy(feeAmount);
        return { school, feeAmount, owner, address1, address2, address3 };
    }

    describe('Deployment', () => {
        it('Should deploy SchoolManagement contract', async () => {
            const { school, owner } = await loadFixture(deploySchoolManagementFixture);

            expect(await school.principal()).to.equal(owner.address);
        });

        it('Should set the right feeAmount', async () => {
            const { school, feeAmount } = await loadFixture(deploySchoolManagementFixture);

            expect(await school.feeAmount()).to.equal(feeAmount);
        });

        it('Should set the right owner', async () => {
            const { school, owner } = await loadFixture(deploySchoolManagementFixture);

            expect(await school.principal()).to.equal(owner.address);
        });

        it('should set the right student count', async () => {
            const { school } = await loadFixture(deploySchoolManagementFixture);
            
            const studentCount = await school.student_count();
            expect(studentCount).to.equal(0);
        });


    });

    describe('Student', () => {
        it('Should enroll a student', async () => {
            const { school, address1 } = await loadFixture(deploySchoolManagementFixture);
            const name = 'Leo';
            const age = 20;
            const _class = 0;
            const gender = 0;

            await school.registerStudent(name, age, _class, gender, address1.address, false);
            const studentCount = await school.student_count();
            expect(studentCount).to.equal(1);
        });
        it('should not enroll a student if not a teach or principal', async () => {
            const { school, address1, address2 } = await loadFixture(deploySchoolManagementFixture);
            const name = 'Leo';
            const age = 20;
            const _class = 0;
            const gender = 0;

            await expect(school.connect(address2).registerStudent(name, age, _class, gender, address1.address, false)).to.be.revertedWith('User not Admin');
        });
        it('should increase student count when a student is enrolled', async () => {
            const { school, address1 } = await loadFixture(deploySchoolManagementFixture);
            const name = 'Leo';
            const age = 20;
            const _class = 0;
            const gender = 0;
            await school.registerStudent(name, age, _class, gender, address1.address, false);
            const studentCount = await school.student_count();
            expect(studentCount).to.equal(1);
        });

        it("should emit a 'StudentRegistered' event when a student is enrolled", async () => {
            const { school, address1 } = await loadFixture(deploySchoolManagementFixture);
            const name = 'Leo';
            const age = 20;
            const _class = 0;
            const gender = 0;
            await expect(school.registerStudent(name, age, _class, gender, address1.address, false))
                .to.emit(school, 'StudentRegistered');

        });

        
    });

})