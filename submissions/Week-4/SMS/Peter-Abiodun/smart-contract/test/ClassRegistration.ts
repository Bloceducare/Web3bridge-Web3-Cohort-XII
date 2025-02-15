import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer } from "ethers";

describe("ClassRegistration", function () {
  let classRegistration: any;
  let admin: Signer, user: Signer;

    beforeEach(async function () {
        [admin, user] = await ethers.getSigners();
        const ClassRegistrationFactory = await ethers.getContractFactory("ClassRegistration");
        classRegistration = await ClassRegistrationFactory.deploy();
    });

    it("Should set the deployer as the admin", async function () {
        expect(await classRegistration.admin()).to.equal(await admin.getAddress());
    });

    it("Should allow admin to register a student", async function () {
        await classRegistration.registerStudent("Alice");
        const student = await classRegistration.getStudent(1);

        expect(student.id).to.equal(1);
        expect(student.name).to.equal("Alice");
        expect(await classRegistration.studentCount()).to.equal(1);
    });

    it("Should revert if a non-admin tries to register a student", async function () {
        await expect(
            classRegistration.connect(user).registerStudent("Bob")
        ).to.be.revertedWith("Only admin can perform this action");
    });

    it("Should allow admin to remove a student", async function () {
        await classRegistration.registerStudent("Charlie");
        expect(await classRegistration.studentCount()).to.equal(1);

        await classRegistration.removeStudent(1);
        const student = await classRegistration.getStudent(1);

        expect(student.id).to.equal(0);
        expect(student.name).to.equal("");
    });

    it("Should revert if a non-admin tries to remove a student", async function () {
        await classRegistration.registerStudent("David");

        await expect(
            classRegistration.connect(user).removeStudent(1)
        ).to.be.revertedWith("Only admin can perform this action");
    });

    it("Should revert when trying to fetch a non-existent student", async function () {
        await expect(classRegistration.getStudent(99)).to.be.revertedWith("Invalid student ID");
    });
});
