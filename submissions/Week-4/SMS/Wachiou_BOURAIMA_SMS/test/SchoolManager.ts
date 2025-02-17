import { expect } from "chai"
import hre from "hardhat"
import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { HardhatEthersHelpers } from "hardhat/types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";



describe("SchoolManager", function () {
  async function DeploySchoolManagerFixture() {
    const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

    const [owner, student1, student2, staff] = await hre.ethers.getSigners();

    const SchoolManager = await hre.ethers.getContractFactory("SchoolManager");
    const deploySchoolManager = await SchoolManager.deploy();

    return { deploySchoolManager, owner, student1, student2, staff, ADDRESS_ZERO };
  }

  describe("Contract Deployment", function () {
    it("should deploy the contract with the owner as deployer", async function () {
      const { deploySchoolManager, owner } = await DeploySchoolManagerFixture();
      const runner = (await deploySchoolManager).runner as HardhatEthersSigner;
      expect(runner.address).to.equal(owner.address);
    });

    it("should have a valid contract address", async function () {
      const { deploySchoolManager, ADDRESS_ZERO } = await DeploySchoolManagerFixture();
      expect((await deploySchoolManager).target).to.not.equal(ADDRESS_ZERO);
    });
  });

  describe("Student and Staff Registration", function () {
    it("should allow the owner to register a student", async function () {
      const { deploySchoolManager, owner, student1 } = await loadFixture(DeploySchoolManagerFixture);
      // student count before registration
      let studentCountBefore = Number(await (await deploySchoolManager.studentCount()));
      await deploySchoolManager.connect(owner).registerStudent(student1.address, "John Doe", "M", 18);
      let studentCountAfter = Number(await (await deploySchoolManager.studentCount()))

        expect(studentCountAfter).to.equal(studentCountBefore + 1);
      });

    it("should allow the owner to register a staff member", async function () {
      const { deploySchoolManager, owner, staff } = await loadFixture(DeploySchoolManagerFixture);
      const staffCountBefore = Number(await (await deploySchoolManager.studentCount()));
      await deploySchoolManager.connect(owner).registerStaff(staff.address, "Maths", "F", 1, "Maths Teacher");
      const staffCountAfter = Number(await (await deploySchoolManager.studentCount()));

      expect(staffCountAfter).to.equal(staffCountBefore + 1);
    });

    it("should not allow non-owner to register a student", async function () {
      const { deploySchoolManager, student1 } = await loadFixture(DeploySchoolManagerFixture);
      await expect(deploySchoolManager.connect(student1).registerStudent(student1.address, "DES samos", "M", 18))
        .to.be.revertedWith("Only owner can register students");
    });
  });

  describe("School Fee Payment", function () {
    it("should allow a student to pay fees", async function () {
      const { deploySchoolManager, owner, student1 } = await DeploySchoolManagerFixture();
      await deploySchoolManager.connect(owner).registerStudent(student1.address, "John Doe", "M", 18);

      // const feeAmount = hre.ethers.parseEther("1");
      await deploySchoolManager.connect(student1).paySchoolFee(0.5);
      const hasPaid = (await deploySchoolManager.getStudent(student1.address)).hasPaidSchoolFee;

      expect(hasPaid).to.equal(true);

    
    });

    // it("should not allow non-students to pay fees", async function () {
    //   const { deploySchoolManager, staff } = await DeploySchoolManagerFixture();
    //   await expect(deploySchoolManager.connect(staff).payFees({ value: hre.ethers.utils.parseEther("1") }))
    //     .to.be.revertedWith("Only students can pay fees");
    // });
  });
});
