import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("School Management System Test", () => {
  const deploySchoolManagementSystem =  async () => {
    const [owner, account1, account2, account3, account4] = await hre.ethers.getSigners()
    const SMSContract = await hre.ethers.getContractFactory("SchoolManagementSystem")
    const schoolName = "Convenant"
    const deployedSMSContract = await SMSContract.deploy(schoolName)

    return { deployedSMSContract, owner, account1, account2, account3, account4, schoolName}
  }

  describe("Deployment", () => {
    it("should test if it's the principal that deployed the contract", async () => {
      const { deployedSMSContract, owner } = await loadFixture(deploySchoolManagementSystem)
      const principal = await deployedSMSContract.getPrincipal()
      
      expect(principal).to.equals(owner.address);
    })
    
    it("should test for the school name", async () => {
      const { deployedSMSContract, schoolName } = await loadFixture(deploySchoolManagementSystem)
      const schName = await deployedSMSContract.schoolName()

      expect(schName).to.equals(schoolName);
    })
    
    it("should set state variable to default", async () => {
      const { deployedSMSContract } = await loadFixture(deploySchoolManagementSystem)
      const courseCount = await deployedSMSContract.courseCount()
      const schoolFee = await deployedSMSContract.schoolFee()

      expect(courseCount).to.equals(0);
      expect(schoolFee).to.equals(0);
    })
  })

  describe("Register Staff", () => {
    it("should be able to register a staff", async () => {
      const {deployedSMSContract, account1} = await loadFixture(deploySchoolManagementSystem)
      await deployedSMSContract.registerStaff("John", "Biochemistry", account1.address);

      expect((await deployedSMSContract.staffs(account1.address)).isRegistered).to.be.true;
      expect((await deployedSMSContract.staffs(account1.address)).name).to.equal("John");
      expect((await deployedSMSContract.staffs(account1.address)).areaOfSpecialization).to.equal("Biochemistry");
    })

    it("should emit an event after successful registration", async () => {
      const {deployedSMSContract, account1} = await loadFixture(deploySchoolManagementSystem)
6
      expect(await deployedSMSContract.registerStaff("John", "Biochemistry", account1.address)).emit;
    })

    it("should revert if a non-principal is trying to register a staff", async () => {
      const {deployedSMSContract, account1, account2} = await loadFixture(deploySchoolManagementSystem)

      expect(deployedSMSContract.connect(account1).registerStaff("John", "Biochemistry", account2.address)).to.reverted
      expect(deployedSMSContract.connect(account1).registerStaff("John", "Biochemistry", account2.address)).to.be.revertedWith("ONLY PRINCIPAL HAS AUTHORIZE ACCESS")
    })

    it("should revert if a zero address is trying to register a staff", async () => {
      const {deployedSMSContract, account1, account2} = await loadFixture(deploySchoolManagementSystem)

      await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: ["0x0000000000000000000000000000000000000000"],
      });
      const addressZeroRunner = await hre.ethers.getSigner("0x0000000000000000000000000000000000000000")
      await account1.sendTransaction({
        to: addressZeroRunner.address,
        value: hre.ethers.parseEther("1.0"), // Send 1 ETH to zero address
      });

      expect(deployedSMSContract.connect(addressZeroRunner).registerStaff("John", "Biochemistry", account2.address)).to.reverted
      // expect(deployedSMSContract.connect(addressZeroRunner).registerStaff("John", "Biochemistry", account2.address)).to.be.revertedWith("INVALID ADDRESS PROVIDED")
    })
  })

  describe("Register Student", () => {
    it("principal should be able to register a student", async () => {
      const {deployedSMSContract, owner, account2} = await loadFixture(deploySchoolManagementSystem)
      await deployedSMSContract.registerStudent("Peter", 24, "male", "Biochemistry", account2.address)
      
      expect((await deployedSMSContract.students(account2)).name).to.equal("Peter");
      expect((await deployedSMSContract.students(account2)).age).to.equal(24);
      expect((await deployedSMSContract.students(account2)).gender).to.equal("male");
      expect((await deployedSMSContract.students(account2)).courseOfStudy).to.equal("Biochemistry");
      expect((await deployedSMSContract.students(account2)).addr).to.equal(account2.address);
      expect((await deployedSMSContract.students(account2)).registeredBy).to.equal(owner.address);
      expect((await deployedSMSContract.students(account2)).hasPaid).to.false;
      expect((await deployedSMSContract.students(account2)).amountPaid).to.equal(0);
    })
    
    it("staff should be able to register a student", async () => {
      const {deployedSMSContract, account1, account2} = await loadFixture(deploySchoolManagementSystem)
      await deployedSMSContract.registerStaff("John", "Biochemistry", account1.address);
      await deployedSMSContract.connect(account1).registerStudent("Peter", 24, "male", "Biochemistry", account2.address)

      expect((await deployedSMSContract.students(account2)).name).to.equal("Peter");
      expect((await deployedSMSContract.students(account2)).age).to.equal(24);
      expect((await deployedSMSContract.students(account2)).gender).to.equal("male");
      expect((await deployedSMSContract.students(account2)).courseOfStudy).to.equal("Biochemistry");
      expect((await deployedSMSContract.students(account2)).addr).to.equal(account2.address);
      expect((await deployedSMSContract.students(account2)).registeredBy).to.equal(account1.address);
      expect((await deployedSMSContract.students(account2)).hasPaid).to.false;
      expect((await deployedSMSContract.students(account2)).amountPaid).to.equal(0);
    })

    it("should emit event after successful student registration", async () => {
      const {deployedSMSContract, owner, account2} = await loadFixture(deploySchoolManagementSystem)

      expect(deployedSMSContract.connect(owner).registerStudent("Peter", 20, "male", "Biochemistry", account2.address)).to.emit
    })

    it("should revert if any other person try to register student aside principal or staff", async () => {
      const {deployedSMSContract, account3, account2} = await loadFixture(deploySchoolManagementSystem)

      expect(deployedSMSContract.connect(account3).registerStudent("Peter", 24, "male", "Biochemistry", account2.address)).to.be.reverted
      expect(deployedSMSContract.connect(account3).registerStudent("Peter", 24, "male", "Biochemistry", account2.address)).to.be.revertedWith("EITHER PRINCIPAL OR STAFF HAS AUTHORIZE ACCESS")
    })

    it("should revert if age is lesser than 16", async () => {
      const {deployedSMSContract, owner, account2} = await loadFixture(deploySchoolManagementSystem)

      expect(deployedSMSContract.connect(owner).registerStudent("Peter", 15, "male", "Biochemistry", account2.address)).to.be.reverted
      expect(deployedSMSContract.connect(owner).registerStudent("Peter", 10, "male", "Biochemistry", account2.address)).to.be.revertedWith("NOT OLD ENOUGH TO REGISTER AS A STUDENT")
    })
  })

  describe("Remove Staff", () => {
    it("should successfully remove staff", async () => {
      const {deployedSMSContract, account1, account2} = await loadFixture(deploySchoolManagementSystem)
      await deployedSMSContract.registerStaff("John", "Biochemistry", account1.address);
      await deployedSMSContract.registerStaff("John", "Biochemistry", account2.address);
      await deployedSMSContract.removeStaff(account1.address);

      expect((await deployedSMSContract.staffs(account1.address)).name).to.be.empty;
      expect((await deployedSMSContract.staffs(account1.address)).areaOfSpecialization).to.be.empty;
      expect((await deployedSMSContract.staffs(account1.address)).isRegistered).to.be.false;
      expect((await deployedSMSContract.staffs(account2.address)).name).to.not.empty;
      expect((await deployedSMSContract.staffs(account2.address)).areaOfSpecialization).to.not.empty;
      expect((await deployedSMSContract.staffs(account2.address)).isRegistered).to.true;
    })

    it("should revert if not called by principal", async () => {
      const {deployedSMSContract, account1, account2, account3} = await loadFixture(deploySchoolManagementSystem)
      await deployedSMSContract.registerStaff("John", "Biochemistry", account1.address); 
      await deployedSMSContract.registerStaff("John", "Biochemistry", account2.address);

      expect(deployedSMSContract.connect(account2).removeStaff(account1.address)).to.reverted;
      expect(deployedSMSContract.connect(account3).removeStaff(account1.address)).to.reverted;
    })
  })

  describe("Remove Student", () => {
    it("should successfully remove student", async () => {
      const {deployedSMSContract, account1, account2, account3} = await loadFixture(deploySchoolManagementSystem)
      await deployedSMSContract.registerStaff("John", "Biochemistry", account1.address);

      await deployedSMSContract.registerStudent("Peter", 24, "male", "Biochemistry", account2.address)
      await deployedSMSContract.connect(account1).registerStudent("Peter", 24, "male", "Biochemistry", account3.address)
      await deployedSMSContract.removeStudent(account2.address);
      await deployedSMSContract.removeStudent(account3.address);
      // await deployedSMSContract.connect(account1).removeStaff(account3.address);

      expect((await deployedSMSContract.students(account2.address)).name).to.be.empty;
      expect((await deployedSMSContract.students(account2.address)).courseOfStudy).to.be.empty;
      expect((await deployedSMSContract.students(account2.address)).hasPaid).to.be.false;
      expect((await deployedSMSContract.students(account3.address)).name).to.be.empty;
      expect((await deployedSMSContract.students(account3.address)).courseOfStudy).to.be.empty;
      expect((await deployedSMSContract.students(account3.address)).hasPaid).to.be.false;
      // expect((await deployedSMSContract.connect(account1).students(account2.address)).name).to.be.empty;
      // expect((await deployedSMSContract.connect(account1).students(account2.address)).courseOfStudy).to.be.empty;
      // expect((await deployedSMSContract.connect(account1).students(account2.address)).hasPaid).to.be.false;
    })

    it("should revert if not called by principal", async () => {
      const {deployedSMSContract, account1, account2, account4} = await loadFixture(deploySchoolManagementSystem)
      await deployedSMSContract.registerStaff("John", "Biochemistry", account1.address);
      await deployedSMSContract.registerStudent("Peter", 24, "male", "Biochemistry", account2.address)
      
      expect(deployedSMSContract.connect(account1).removeStudent(account2.address)).to.reverted;
      expect(deployedSMSContract.connect(account4).removeStudent(account2.address)).to.reverted;
    })
  })
  
    describe("Set School Fee", () => {
      it("should set school fee successfully", async () => {
        const {deployedSMSContract} = await loadFixture(deploySchoolManagementSystem)
        const schoolFeeAmount = hre.ethers.parseEther("0.01")
        await deployedSMSContract.setSchoolFee(schoolFeeAmount)
        const newlySetSchoolFee = await deployedSMSContract.schoolFee()

        expect(newlySetSchoolFee).to.equal(schoolFeeAmount)
      })

      it("should revert if school fee is not set by principal", async () => {
        const {deployedSMSContract, account1} = await loadFixture(deploySchoolManagementSystem)
        const schoolFeeAmount = hre.ethers.parseEther("0.01")

        expect(deployedSMSContract.connect(account1).setSchoolFee(schoolFeeAmount)).to.reverted
      })
    })

  describe("Pay School Fee function", () => {
    it("should be able to pay school fee", async() => {
      const {deployedSMSContract, account1} = await loadFixture(deploySchoolManagementSystem);
      await deployedSMSContract.registerStudent("Peter", 24, "male", "Biochemistry", account1.address)
      const amount = hre.ethers.parseEther("0.01")
      await deployedSMSContract.setSchoolFee(amount)
      await deployedSMSContract.connect(account1).paySchoolFee({ value: amount })

      expect((await deployedSMSContract.students(account1)).hasPaid).to.true;
      expect((await deployedSMSContract.students(account1)).amountPaid).to.equal(amount);
    })

    it("should be able to emit event after school fee payment", async () => {
      const {deployedSMSContract, account1} = await loadFixture(deploySchoolManagementSystem);
      await deployedSMSContract.registerStudent("Peter", 24, "male", "Biochemistry", account1.address)
      const amount = hre.ethers.parseEther("0.01")
      await deployedSMSContract.setSchoolFee(amount)
      await deployedSMSContract.connect(account1).paySchoolFee({ value: amount })

      expect((await deployedSMSContract.students(account1)).hasPaid).to.emit;
    })

    it("should revert if school fee is already paid", async () => {
      const {deployedSMSContract, account1} = await loadFixture(deploySchoolManagementSystem);
      await deployedSMSContract.registerStudent("Peter", 24, "male", "Biochemistry", account1.address)
      const amount = hre.ethers.parseEther("0.01")
      await deployedSMSContract.setSchoolFee(amount)
      await deployedSMSContract.connect(account1).paySchoolFee({ value: amount })

      expect(deployedSMSContract.connect(account1).paySchoolFee({ value: amount })).reverted
      expect(deployedSMSContract.connect(account1).paySchoolFee({ value: amount })).revertedWith("SCHOOL FEE ALREADY PAID")
    })

    it("should revert if school fee amount is wrong", async () => {
      const {deployedSMSContract, account1} = await loadFixture(deploySchoolManagementSystem);
      await deployedSMSContract.registerStudent("Peter", 24, "male", "Biochemistry", account1.address)
      const schoolFeeAmount = hre.ethers.parseEther("0.01")
      const wrongSchoolFeeAmount = hre.ethers.parseEther("0.015")
      await deployedSMSContract.setSchoolFee(schoolFeeAmount)

      expect(deployedSMSContract.connect(account1).paySchoolFee({ value: wrongSchoolFeeAmount })).reverted
      expect(deployedSMSContract.connect(account1).paySchoolFee({ value: wrongSchoolFeeAmount })).revertedWith("SCHOOL FEE ALREADY PAID")
    })
  })

  describe("Create Course", () => {
    it("should create course", async () => {
      const {deployedSMSContract, owner, account1} = await loadFixture(deploySchoolManagementSystem);
      await deployedSMSContract.registerStaff("John", "Biochemistry", account1.address);

      await deployedSMSContract.createCourse("BCH101")
      await deployedSMSContract.connect(account1).createCourse("BCH102")

      expect(await deployedSMSContract.courseCount()).to.equal(2)
      expect((await deployedSMSContract.courses(1)).creator).to.equal(owner.address)
      expect((await deployedSMSContract.courses(2)).creator).to.equal(account1.address)
    })

    it("should emit event after successful course creation", async () => {
      const {deployedSMSContract, account1} = await loadFixture(deploySchoolManagementSystem);
      await deployedSMSContract.registerStaff("John", "Biochemistry", account1.address);

      expect(await deployedSMSContract.createCourse("BCH101")).to.emit
      expect(await deployedSMSContract.connect(account1).createCourse("BCH102")).to.emit
    })

    it("should revert if the course is being created by neither principal nor staff", async () => {
      const {deployedSMSContract, account1} = await loadFixture(deploySchoolManagementSystem);

      expect(deployedSMSContract.connect(account1).createCourse("BCH101")).to.reverted
    })
  })

  describe("Register Course", () => {
    it("should register Course successfully", async () => {
      const {deployedSMSContract, account1} = await loadFixture(deploySchoolManagementSystem);
      await deployedSMSContract.registerStudent("Peter", 24, "male", "Biochemistry", account1.address)

      const schoolFeeAmount = hre.ethers.parseEther("0.01")
      await deployedSMSContract.setSchoolFee(schoolFeeAmount)
      await deployedSMSContract.connect(account1).paySchoolFee({ value: schoolFeeAmount })
      await deployedSMSContract.connect(account1).registerCourse("BCH101")
      await deployedSMSContract.connect(account1).registerCourse("BCH102")
      await deployedSMSContract.connect(account1).registerCourse("BCH103")
      await deployedSMSContract.connect(account1).registerCourse("BCH104")

      expect((await deployedSMSContract.connect(account1).students(account1)).registeredCoursesCount).to.equal(4)
    })

    it("should revert if anyone aside student try to register", async () => {
      const {deployedSMSContract} = await loadFixture(deploySchoolManagementSystem);

      expect(deployedSMSContract.registerCourse("BCH104")).reverted
    })

    it("should revert if student have not pay school fee", async () => {
      const {deployedSMSContract, account1} = await loadFixture(deploySchoolManagementSystem);
      await deployedSMSContract.registerStudent("Peter", 24, "male", "Biochemistry", account1.address)

      expect(deployedSMSContract.connect(account1).registerCourse("BCH101")).to.reverted
    })
  })

  describe("Upload Scores", () => {
    it("should upload scores successfully", async () => {
      const {deployedSMSContract, account1, account2, account3} = await loadFixture(deploySchoolManagementSystem);
      await deployedSMSContract.registerStaff("John", "Biochemistry", account1.address);
      await deployedSMSContract.registerStudent("Peter", 24, "male", "Biochemistry", account2.address)

      await deployedSMSContract.uploadScores("BCH101", account2.address, 80)
      await deployedSMSContract.connect(account1).uploadScores("BCH102", account2.address, 90)

      expect(await deployedSMSContract.connect(account2).checkScores("BCH101")).to.equal(80)
      expect(await deployedSMSContract.connect(account2).checkScores("BCH102")).to.equal(90)
    })
    
    it("should revert if scores is greater than 100", async () => {
      const {deployedSMSContract, account2} = await loadFixture(deploySchoolManagementSystem);
      
      expect(deployedSMSContract.uploadScores("BCH101", account2.address, 101)).to.reverted
      expect(deployedSMSContract.uploadScores("BCH101", account2.address, 101)).to.revertedWith('INVALID SCORE')
    })
  })
})