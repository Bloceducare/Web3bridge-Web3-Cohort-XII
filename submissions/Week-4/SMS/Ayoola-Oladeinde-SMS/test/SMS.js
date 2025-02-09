const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('SchoolSystem', function () {
  let SchoolSystem, schoolSystem;
  let principal, student1, student2, teacher1, teacher2;

  beforeEach(async function () {
    [principal, student1, student2, teacher1, teacher2] = await ethers.getSigners();

    // Deploy SchoolSystem contract
    SchoolSystem = await ethers.getContractFactory('SchoolSystem');
    schoolSystem = await SchoolSystem.deploy();
    await schoolSystem.waitForDeployment();
  });

  it('Should set the deployer as the principal', async function () {
    expect(await schoolSystem.principal()).to.equal(principal.address);
  });

  it('Should allow the principal to add a student', async function () {
    await schoolSystem.connect(principal).addStudent(student1.address, 'Alice', 10);
    
    const studentDetails = await schoolSystem.getStudentDetails(student1.address);
    expect(studentDetails[0]).to.equal('Alice'); // Name
    expect(studentDetails[1]).to.equal(10); // Class Level
    expect(studentDetails[2]).to.equal(0); // Fees Paid
  });

  it('Should not allow a non-principal to add a student', async function () {
    await expect(
      schoolSystem.connect(student1).addStudent(student2.address, 'Bob', 9)
    ).to.be.revertedWith('Only principal can perform this action');
  });

  it('Should allow the principal to add a teacher', async function () {
    await schoolSystem.connect(principal).addTeacher(teacher1.address, 'Mr. Smith', 'Math', ethers.parseEther('2'));

    const teacherDetails = await schoolSystem.getTeacherDetails(teacher1.address);
    expect(teacherDetails[0]).to.equal('Mr. Smith'); // Name
    expect(teacherDetails[1]).to.equal('Math'); // Subject
    expect(teacherDetails[2]).to.equal(ethers.parseEther('2')); // Salary
  });

  it('Should allow a student to pay fees', async function () {
    await schoolSystem.connect(principal).addStudent(student1.address, 'Alice', 10);
    
    await schoolSystem.connect(student1).payFees({ value: ethers.parseEther('1') });

    const studentDetails = await schoolSystem.getStudentDetails(student1.address);
    expect(studentDetails[2]).to.equal(ethers.parseEther('1')); // Fees Paid
  });

  it('Should prevent fee payment from non-students', async function () {
    await expect(
      schoolSystem.connect(student1).payFees({ value: ethers.parseEther('1') })
    ).to.be.revertedWith('You are not registered as a student');
  });

  it('Should allow the principal to withdraw funds', async function () {
    await schoolSystem.connect(principal).addStudent(student1.address, 'Alice', 10);
    await schoolSystem.connect(student1).payFees({ value: ethers.parseEther('5') });

    const initialBalance = await ethers.provider.getBalance(principal.address);
    await schoolSystem.connect(principal).withdrawFunds(ethers.parseEther('3'));
    const finalBalance = await ethers.provider.getBalance(principal.address);

    expect(finalBalance).to.be.gt(initialBalance); // Principal should receive funds
  });

  it('Should not allow non-principal to withdraw funds', async function () {
    await expect(
      schoolSystem.connect(student1).withdrawFunds(ethers.parseEther('1'))
    ).to.be.revertedWith('Only principal can perform this action');
  });

  it('Should allow the principal to pay teacher salaries', async function () {
    await schoolSystem.connect(principal).addTeacher(teacher1.address, 'Mr. Smith', 'Math', ethers.parseEther('2'));

    await schoolSystem.connect(principal).addStudent(student1.address, 'Alice', 10);
    await schoolSystem.connect(student1).payFees({ value: ethers.parseEther('5') });

    const initialBalance = await ethers.provider.getBalance(teacher1.address);
    await schoolSystem.connect(principal).payTeacherSalary(teacher1.address);
    const finalBalance = await ethers.provider.getBalance(teacher1.address);

    expect(finalBalance).to.be.gt(initialBalance); // Teacher should receive salary
  });

  it('Should not allow non-principal to pay teacher salaries', async function () {
    await schoolSystem.connect(principal).addTeacher(teacher1.address, 'Mr. Smith', 'Math', ethers.parseEther('2'));

    await expect(
      schoolSystem.connect(student1).payTeacherSalary(teacher1.address)
    ).to.be.revertedWith('Only principal can perform this action');
  });

  it('Should not allow salary payment if insufficient funds', async function () {
    await schoolSystem.connect(principal).addTeacher(teacher1.address, 'Mr. Smith', 'Math', ethers.parseEther('10'));

    await expect(
      schoolSystem.connect(principal).payTeacherSalary(teacher1.address)
    ).to.be.revertedWith('Insufficient funds');
  });
});
