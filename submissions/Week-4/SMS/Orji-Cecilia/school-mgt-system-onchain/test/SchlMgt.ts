import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("SchlMgt", function () {
    async function deploySchlMgt() {
        const [owner, address1, address2, address3, address4, address5, address6] = await hre.ethers.getSigners();

        const SchlMgt = await hre.ethers.getContractFactory("SchlMgt");
        const schlMgt = await SchlMgt.deploy(owner.address); 
        await schlMgt.waitForDeployment(); 

        return { owner, address1, address2, address3, address4, address5, address6, schlMgt };
    }

    describe("Deployment", function () {
        it("Should be deployed by owner", async function () {
            const { owner, schlMgt } = await loadFixture(deploySchlMgt);

            expect(await schlMgt.principal()).to.equal(owner.address);
        });

        it("should not be deployed at address zero", async function () {
            const { schlMgt } = await loadFixture(deploySchlMgt);

            expect(await schlMgt.getAddress()).to.not.be.equal("0x0000000000000000000000000000000000000000");
        });
    });

    describe("AddTeacher", function () {
        it("reverts when not called by principal", async function () {
            const { schlMgt, address4, address1 } = await loadFixture(deploySchlMgt);
    
            await expect(schlMgt.connect(address4).assignTeacher(address1.address, "Rahmah", "Math")).to.be.revertedWith("Only principal can call this function");
        });
    
        it("does not revert when called by principal", async function () {
            const { schlMgt, address4 } = await loadFixture(deploySchlMgt);
    
            await expect(schlMgt.assignTeacher(address4.address, "Rahmah", "Math")).not.to.be.reverted;
        });
    
        it("reverts when teacher already exists", async function () {
            const { schlMgt, address2 } = await loadFixture(deploySchlMgt);
    
            await schlMgt.assignTeacher(address2.address, "Rahmah", "Math");
    
            await expect(schlMgt.assignTeacher(address2.address, "Rahmah", "Math")).to.be.revertedWith("Teacher already exists");
        });
    
        it("increases the total teachers count by 1", async function () {
            const { schlMgt, address2 } = await loadFixture(deploySchlMgt);
    
            const prevTotalTeachers = await schlMgt.nextTeacherId();
    
            await schlMgt.assignTeacher(address2.address, "Rahmah", "Math");
    
            const newTotalTeachers = await schlMgt.nextTeacherId();
            expect(newTotalTeachers).to.equal(prevTotalTeachers + BigInt(1)); 
        });
    
        it("correctly sets the Teacher's details", async function () {
            const { schlMgt, address2 } = await loadFixture(deploySchlMgt);

            await schlMgt.assignTeacher(address2.address, "Rahmah", "Math");

            const teacherIndex = await schlMgt.teacherIndex(address2.address);
            const newTeacher = await schlMgt.teachers(teacherIndex - BigInt(1)); 

            // Teacher ID should match the teacherIndex
            expect(newTeacher.id).to.equal(teacherIndex); 
            expect(newTeacher.name).to.equal("Rahmah");
            expect(newTeacher.subject).to.equal("Math");
            expect(newTeacher.teacherAddress).to.equal(address2.address);
        });

        it("updates teacherAddresses with new teacher address", async function () {
            const { schlMgt, address2 } = await loadFixture(deploySchlMgt);
        
            await schlMgt.assignTeacher(address2.address, "Rahmah", "Math");
        
            const totalTeachers = await schlMgt.nextTeacherId();
            const lastTeacherAddress = await schlMgt.teacherAddresses(totalTeachers - BigInt(2)); // Subtract 1 safely
            expect(lastTeacherAddress).to.equal(address2.address);
        });

        it("emits TeacherAdded event when a new teacher is added", async function () {
            const { schlMgt, address2 } = await loadFixture(deploySchlMgt);
        
            const tx = await schlMgt.assignTeacher(address2.address, "Rahmah", "Math");
            const receipt = await tx.wait();
            
            const teacherIndex = await schlMgt.teacherIndex(address2.address);
            console.log("Expected Teacher ID:", teacherIndex); 
        
            await expect(tx)
                .to.emit(schlMgt, "TeacherAdded")
                .withArgs(teacherIndex, "Rahmah", "Math"); 
        });        
        
    });
});
