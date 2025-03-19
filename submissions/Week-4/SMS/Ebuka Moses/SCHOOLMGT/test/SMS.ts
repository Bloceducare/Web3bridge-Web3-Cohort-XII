import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect, should } from "chai";
import hre from "hardhat";

describe("Test our SMS", () => {
  async function deployOurSMS() {
    const [owner, address1, address2] = await hre.ethers.getSigners();

    const smsFactory = await hre.ethers.getContractFactory("SMS");
    //const duration = 60 * 60;
    //const latestTime = await time.latest();
    //const _time = latestTime + duration;
    const deploysmsFactory = await smsFactory.deploy();
    return { owner, address1, deploysmsFactory };
  }

  describe("Deployment", () => {
    it("Should deploy sms contract", async () => {
      const { deploysmsFactory, owner } = await loadFixture(deployOurSMS);

      const runner = deploysmsFactory.runner as HardhatEthersSigner;

      expect(runner.address).to.equal(owner.address);
    });

    it("it should register a teacher", async () => {
      const { deploysmsFactory, owner, address1 } = await loadFixture(
        deployOurSMS
      );

      await expect(
        deploysmsFactory
          .connect(address1)
          .registerTeacher("ebuka", 30, 0, 0, address1)
      );
    });

    it("should deploy erc721 contract", async () => {
      const { deploysmsFactory, owner, address1 } = await loadFixture(
        deployOurSMS
      );
      
    // await sms.registerTeacher("John Doe", 35, 2, 0, teacher1.address);

    // const result = await sms.isTeacher(teacher1.address);
    // expect(result).to.equal(true);

    
      await expect(
        deploysmsFactory
          .registerTeacher("ebuka", 30, 0, 0, address1)
      );
      const Before =await deploysmsFactory.isTeacher(address1);
      expect(Before).to.be.equal(false);
    });

   
  });
});
