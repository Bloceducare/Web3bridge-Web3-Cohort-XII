import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
  import { expect } from "chai";
  import { ethers } from "hardhat";
  
  describe("Sms", function () {
      let SMS, sms, owner, student1, student2, staff1;
  
      beforeEach(async function () {
          [owner, student1, student2, staff1] = await ethers.getSigners();
          SMS = await ethers.getContractFactory("Sms");
          sms = await SMS.deploy();
      });
  
      it("Should deploy and set the admin correctly", async function () {
          expect(await sms.owner()).to.equal(owner.address);
      });
  
      it("Should register a student", async function () {
          await sms.registerStudent(student1.address, "Alice");
          const student = await sms.students(student1.address);
          expect(student.name).to.equal("Alice");
          expect(student.hasPaidFees).to.be.false;
      });
  
      it("Should register a staff member", async function () {
          await sms.registerStaff(staff1.address, "Professor Bob");
          const staff = await sms.staff(staff1.address);
          expect(staff.name).to.equal("Professor Bob");
      });
  
      it("Should allow a student to pay fees", async function () {
          await sms.registerStudent(student1.address, "Alice");
          await sms.connect(student1).payFees({ value: ethers.parseEther("1.0") });
          const student = await sms.students(student1.address);
          expect(student.hasPaidFees).to.be.true;
          expect(student.feesPaid).to.equal(ethers.parseEther("1.0"));
      });
  
      it("Should not allow non-students to pay fees", async function () {
          await expect(sms.connect(staff1).payFees({ value: ethers.parseEther("1.0") }))
              .to.be.revertedWith("Not a student");
      });
  
      it("Should allow admin to withdraw fees", async function () {
          await sms.registerStudent(student1.address, "Alice");
          await sms.connect(student1).payFees({ value: ethers.parseEther("1.0") });
          
          const initialBalance = await ethers.provider.getBalance(owner.address);
          await sms.withdrawFees();
          const finalBalance = await ethers.provider.getBalance(owner.address);
  
          expect(finalBalance).to.be.gt(initialBalance);
      });
  
      it("Should not allow non-admins to register students", async function () {
          await expect(sms.connect(student1).registerStudent(student2.address, "Bob"))
              .to.be.revertedWith("Not an admin");
      });
  
      it("Should not allow non-admins to register staff", async function () {
          await expect(sms.connect(student1).registerStaff(staff1.address, "Charlie"))
              .to.be.revertedWith("Not an admin");
      });
  
      it("Should not allow non-admins to withdraw fees", async function () {
          await expect(sms.connect(student1).withdrawFees())
              .to.be.revertedWith("Not an admin");
      });
  });
  