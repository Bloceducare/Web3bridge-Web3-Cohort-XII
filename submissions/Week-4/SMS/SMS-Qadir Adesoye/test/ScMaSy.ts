import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("ScMaSy", function () {
    // Test fixture
    async function deployScMaSyFixture() {
        const [school, staff, student, otherAccount] = await ethers.getSigners();
        const ScMaSy = await ethers.getContractFactory("ScMaSy");
        const deployedScMaSy = await ScMaSy.deploy(school.address);
        await deployedScMaSy.waitForDeployment();
        return { deployedScMaSy, school, staff, student, otherAccount };
    }

    // Deployment Tests
    describe("Deployment", function () {
        it("should deploy with the correct school address", async function () {
            const { deployedScMaSy, school } = await loadFixture(deployScMaSyFixture);
            expect(await deployedScMaSy.schoolAddress()).to.equal(school.address);
        });

        it("should revert if deployed with zero address", async function () {
            const ScMaSy = await ethers.getContractFactory("ScMaSy");
            await expect(ScMaSy.deploy(ethers.ZeroAddress))
                .to.be.revertedWith("Invalid school address");
        });
    });

    // Staff Management Tests
    describe("Staff Management", function () {
        it("should allow the school to register a staff member", async function () {
            const { deployedScMaSy, school, staff } = await loadFixture(deployScMaSyFixture);
            
            const tx = await deployedScMaSy.connect(school).registerStaff(staff.address, "John Doe", "Teacher");
            
            await expect(tx)
                .to.emit(deployedScMaSy, "UserRegistered")
                .withArgs(staff.address, "John Doe", 1);

            const userInfo = await deployedScMaSy.getUserInfo(staff.address);
            expect(userInfo.getName).to.equal("John Doe");
            expect(userInfo.getRole).to.equal(1);
            expect(userInfo.getExists).to.be.true;
        });

        it("should revert if registering staff with empty name", async function () {
            const { deployedScMaSy, school, staff } = await loadFixture(deployScMaSyFixture);
            await expect(
                deployedScMaSy.connect(school).registerStaff(staff.address, "", "Teacher")
            ).to.be.revertedWith("Name cannot be empty");
        });
    });

    // Student Management Tests
    describe("Student Management", function () {
        it("should allow staff to register a student", async function () {
            const { deployedScMaSy, school, staff, student } = await loadFixture(deployScMaSyFixture);
            
            await deployedScMaSy.connect(school).registerStaff(staff.address, "Qadir", "Teacher");
            
            const tx = await deployedScMaSy.connect(staff).registerStudent(
                student.address,
                "Hola",
                ethers.parseEther("2")
            );
            
            await expect(tx)
                .to.emit(deployedScMaSy, "UserRegistered")
                .withArgs(student.address, "Hola", 2);

            const studentInfo = await deployedScMaSy.getStudentInfo(student.address);
            expect(studentInfo.getTotalFees).to.equal(ethers.parseEther("2"));
        });

        it("should revert if registering student with zero fees", async function () {
            const { deployedScMaSy, school, staff, student } = await loadFixture(deployScMaSyFixture);
            
            await deployedScMaSy.connect(school).registerStaff(staff.address, "Qadir", "Teacher");
            
            await expect(
                deployedScMaSy.connect(staff).registerStudent(student.address, "Hola", 0)
            ).to.be.revertedWith("Fees must be greater than 0");
        });
    });

    // Fee Management Tests
    describe("Fee Management", function () {
        it("should allow student to pay fees and school to withdraw", async function () {
            const { deployedScMaSy, school, staff, student } = await loadFixture(deployScMaSyFixture);
            
            // Setup
            await deployedScMaSy.connect(school).registerStaff(staff.address, "Qadir", "Teacher");
            await deployedScMaSy.connect(staff).registerStudent(
                student.address,
                "Hola",
                ethers.parseEther("2")
            );
            
            // Pay fees
            const depositAmount = ethers.parseEther("1");
            await deployedScMaSy.connect(student).payFees({ value: depositAmount });
            
            // Check contract balance
            expect(await deployedScMaSy.getContractBalance()).to.equal(depositAmount);
            
            // Withdraw funds
            const initialBalance = await ethers.provider.getBalance(school.address);
            await deployedScMaSy.connect(school).withdrawFunds();
            const finalBalance = await ethers.provider.getBalance(school.address);
            
            // Verify withdrawal
            expect(await deployedScMaSy.getContractBalance()).to.equal(0);
            expect(finalBalance).to.be.gt(initialBalance);
        });

        it("should revert withdrawal if no funds available", async function () {
            const { deployedScMaSy, school } = await loadFixture(deployScMaSyFixture);
            await expect(
                deployedScMaSy.connect(school).withdrawFunds()
            ).to.be.revertedWith("No funds to withdraw");
        });
    });

    // Announcement Tests
    describe("Announcements", function () {
        it("should allow school to make announcement", async function () {
            const { deployedScMaSy, school } = await loadFixture(deployScMaSyFixture);
            const message = "Classes will resume on Monday!";
            
            await expect(deployedScMaSy.connect(school).makeAnnouncement(message))
                .to.emit(deployedScMaSy, "Announcement")
                .withArgs(message);
        });

        it("should revert if announcement message is empty", async function () {
            const { deployedScMaSy, school } = await loadFixture(deployScMaSyFixture);
            await expect(
                deployedScMaSy.connect(school).makeAnnouncement("")
            ).to.be.revertedWith("Message cannot be empty");
        });
    });
});