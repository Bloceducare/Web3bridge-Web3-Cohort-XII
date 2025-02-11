import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { assert } from "console";
import hre from "hardhat";
import { expect } from "chai";
import { ethers } from "ethers";

describe('SMS test', () => {
    
    const deploySMSContract = async  () => {

        const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000';

        const [owner, account1, account2, account3] = await hre.ethers.getSigners();

        const sms = await hre.ethers.getContractFactory("SMS");

        const deploySMS = await sms.deploy();

        return {deploySMS, owner, account1, ADDRESS_ZERO}
    }

    describe("Deployment", () => {

        it('should be deployed by owner', async() => {
            let {deploySMS, owner} = await loadFixture(deploySMSContract);

            const runner = deploySMS.runner as HardhatEthersSigner;

            expect(runner.address).to.equal(owner.address);
        })

        it('should not be address zero', async() => {
            let {deploySMS, ADDRESS_ZERO,} = await loadFixture(deploySMSContract);

            expect(deploySMS.target).to.not.be.equal(ADDRESS_ZERO);
        }) 

        it("detect if caller is address zero", async () => {
            const fees = hre.ethers.parseEther("1");
            const gender = "f";
            const IMPERSONATED_ADDRESS = "0x0000000000000000000000000000000000000000";
      
            let {deploySMS, owner} = await loadFixture(deploySMSContract);
      
            // Enable impersonation
            await hre.network.provider.send("hardhat_impersonateAccount", [
              IMPERSONATED_ADDRESS,
            ]);
            const impersonatedSigner = await hre.ethers.getSigner(
              IMPERSONATED_ADDRESS
            );
      
            // Fund the impersonated account
            await owner.sendTransaction({
              to: IMPERSONATED_ADDRESS,
              value: hre.ethers.parseEther("2"),
            });
      
            // Verify balance
            const balance = await hre.ethers.provider.getBalance(
              IMPERSONATED_ADDRESS
            );
            expect(balance).to.be.gte(hre.ethers.parseEther("2"));
      
            // Expect deposit to revert since msg.sender is zero address
            await expect(
                deploySMS
                .connect(impersonatedSigner)
                .registerStudent("Hello", 12, fees, gender)
            ).to.be.revertedWith("Address zero not allowed");
          });

          it('staff no should be incremented', async() => {
            const fees = hre.ethers.parseEther("1");
            const gender = "f";

            let {deploySMS, account1} = await loadFixture(deploySMSContract);
            let countBeforeIncrement = await deploySMS.studentId();
            await expect(
                deploySMS
                .connect(account1)
                .registerStudent("Hello", 12, fees, gender)
            ).not.to.be.reverted;

            let countAfterIncrement = await deploySMS.studentId();
            expect(countAfterIncrement).to.be.greaterThan(countBeforeIncrement)
            
        })
    })

    describe('SMS', () => {

        it('getStudent', async () => {
            let {deploySMS, account1} = await loadFixture(deploySMSContract);
            await expect(
                deploySMS
                .connect(account1)
                .getStudent(1)
            ).not.to.be.reverted;

        } )

        it("test to update Student", async () => {
            let {deploySMS, owner} = await loadFixture(deploySMSContract);
            await expect(
                deploySMS
                .connect(owner)
                .updateStudent(1, "Hello", 30, "f")
            ).not.to.be.reverted;
        })
    })

    // describe('deposit should only be called by owner', () => {
    //     it('the owner should call the deposite function', async () => {
    //         const depositAmount = ethers.parseEther("1")

    //         let {deployBank, owner, account1} = await loadFixture(deployEventContract);

    //         await expect(
    //             deployBank.connect(owner).deposit({ value: depositAmount })
    //         ).to.not.be.revertedWith("Only owner allowed");


    //     });

    //     it('another user to be able to call the deposite function', async () => {
    //         const depositAmount = ethers.parseEther("1")

    //         let {deployBank, owner, account1} = await loadFixture(deployEventContract);

    //         await expect(
    //             deployBank.connect(account1).deposit({ value: depositAmount })
    //         ).to.be.reverted;
    //     });

    //     it("should fund an impersonated account before depositing", async function () {
    //         const depositAmount = ethers.parseEther("1");
    //         const IMPERSONATED_ADDRESS = "0x0000000000000000000000000000000000000000";
        
    //         let { deployBank, owner } = await loadFixture(deployEventContract);
        
    //         // Enable impersonation
    //         await hre.network.provider.send("hardhat_impersonateAccount", [IMPERSONATED_ADDRESS]);
    //         const impersonatedSigner = await ethers.getSigner(IMPERSONATED_ADDRESS);
        
    //         // Fund the impersonated account
    //         await owner.sendTransaction({
    //             to: IMPERSONATED_ADDRESS,
    //             value: ethers.parseEther("2"),
    //         });
        
    //         // Verify balance
    //         const balance = await ethers.provider.getBalance(IMPERSONATED_ADDRESS);
    //         expect(balance).to.be.gte(ethers.parseEther("2"));
        
    //         // Expect deposit to revert since msg.sender is zero address
    //         await expect(
    //             deployBank.connect(impersonatedSigner).deposit({ value: depositAmount })
    //         ).to.be.reverted;
    //     });

    //     it('amount shouldnt be zero ', async () => {
    //         const depositAmount = 0;

    //         let {deployBank, owner, account1} = await loadFixture(deployEventContract);

    //         await expect(
    //             deployBank.connect(account1).deposit({ value: depositAmount })
    //         ).to.be.reverted;
    //     });

    //     it('amount was sent successfully', async () => {
    //         const depositAmount = ethers.parseEther("1");

    //         let {deployBank, owner, account1} = await loadFixture(deployEventContract);

    //         let initialContractBalance = await ethers.provider.getBalance(deployBank.target);

    //         await expect(
    //             deployBank.connect(owner).deposit({ value: depositAmount })
    //         ).not.to.be.revertedWith("Deposit failed");

    //         // let finalContractBalance = await ethers.provider.getBalance(deployBank.target);
    //         // expect(finalContractBalance).to.equal(initialContractBalance + depositAmount);
    //     });


        
        
    // })

})