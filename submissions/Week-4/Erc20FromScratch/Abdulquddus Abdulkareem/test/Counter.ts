import {
     time,
     loadFixture,
   } from "@nomicfoundation/hardhat-toolbox/network-helpers";
 import { assert } from "console";
 import hre from "hardhat";
 import { expect } from "chai";

 describe('Counter', () => {
     const deployCounterContract = async () => {
          const count = await hre.ethers.getContractFactory('Counter')
          const deployedCount = await count.deploy();
          return {deployedCount};
     }

     describe('increment', () => {
          it('should increment count', async () => {
               const {deployedCount} = await loadFixture(deployCounterContract);

               let countBeforeIncrement = await deployedCount.count();
               
               await deployedCount.increaseCount();

               let countAfterIncrement = await deployedCount.count();

               expect(countAfterIncrement).to.be.greaterThan(countBeforeIncrement);

          } )

          it('should increment count by 1', async () => {
               const {deployedCount} = await loadFixture(deployCounterContract);

                           
               await deployedCount.increaseCount();

               let countAfterIncrement = await deployedCount.count();

               expect(countAfterIncrement).to.be.equal(1);

          } )
     })

     describe('decrement', () => {
          it('should decrement count', async () => {
               const {deployedCount} = await loadFixture(deployCounterContract);

               await deployedCount.increaseCount();  
               let countBeforeDecrease = await deployedCount.count();
               
               await deployedCount.decreaseCount();
               let countAfterDecrease = await deployedCount.count();

               expect(countAfterDecrease).to.be.lessThan(countBeforeDecrease);

          } )

          it('should increment count by 1', async () => {
               const {deployedCount} = await loadFixture(deployCounterContract);

               await deployedCount.increaseCount();          
               await deployedCount.increaseCount();

               let countBeforeDecrease = await deployedCount.count();

               await deployedCount.decreaseCount()
               let countAfterDecrease = await deployedCount.count();

               expect(countAfterDecrease).to.be.equal(1);

          } )
     })
 } )

