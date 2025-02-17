import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat"; // hre is hardhat runtime environment, access to hardhat toolkits

// when writing test we deal with senarios, we can use describe to group senarios(in this case, increment and decrement)
describe('Counter',  () => {
  // when writing test we need to deploy the contract to get access to state, we can use fixture to reuse the same setup in every test
  const deployCounterContract = async () => {
    const counted = await hre.ethers.getContractFactory("Counter"); // get the instance contract from the factory from the hre
    const deployedCount = await counted.deploy();
    return { deployedCount };

    // if the contract has constructor, we can pass the arguments(if you have more than one, you pass all) to the deploy method using this syntax
    // const deployedCounter = await Count.deploy(1); // pass 1 as the initial value
    // const deployedCounter = await Count.deploy('0x1234'); // pass '0x1234' as the initial value
    // return { deployedCounter };
  }

  // increment senario
  describe('increment', () => {
    it('Should increment count', async () => {
      const { deployedCount } = await loadFixture(deployCounterContract); // load the fixture
      let countBeforeIncrement = await deployedCount.count(); // call the increment method before incrementing, count() is a getter method from the contract

      await deployedCount.increment(); // call the increment method

      let countAfterIncrement = await deployedCount.count(); // call the increment method after incrementing to get the new value
      
      expect(countAfterIncrement).to.be.greaterThan(countBeforeIncrement); // assert that the count after increment is greater than the count before increment
    })

    it('should increment count by 1', async () => {
      const {deployedCount} = await loadFixture(deployCounterContract);
      await deployedCount.increment();
      await deployedCount.increment(); // increment the count by 2

      let countAfterIncrement = await deployedCount.count();
      expect(countAfterIncrement).to.equal(2);
    })
  })

  // decrement senario 
  describe('decrement', () => {
    it('should decrement count', async () => {
      const {deployedCount} = await loadFixture(deployCounterContract);
      await deployedCount.increment();
      let countBeforeDecrement = await deployedCount.count();
      await deployedCount.decreseCount();
      let countAfterDecrement = await deployedCount.count();

      expect(countAfterDecrement).to.be.lessThan(countBeforeDecrement);

    })
    it('should decrement count by 1', async () => {
      const {deployedCount} = await loadFixture(deployCounterContract);
      await deployedCount.increment();
      await deployedCount.increment();

      await deployedCount.decreseCount();
      let countAfterDecrement = await deployedCount.count();
      expect(countAfterDecrement).to.be.equal(1);
    })
  })

})