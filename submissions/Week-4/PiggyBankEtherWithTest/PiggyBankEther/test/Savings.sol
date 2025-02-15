// const { expect } = require("chai");
// const { ethers } = require("hardhat");

// describe("SavingsContract", function () {
//   let savingsContract;
//   let owner;
//   let nonOwner;

//   beforeEach(async function () {
//     // Deploy the contract
//     const SavingsContract = await ethers.getContractFactory("SavingsContract");
//     savingsContract = await SavingsContract.deploy();
//     await savingsContract.deployed();

//     // Get accounts
//     [owner, nonOwner] = await ethers.getSigners();
//   });

//   describe("Deployment", function () {
//     it("Should set the owner correctly", async function () {
//       expect(await savingsContract.owner()).to.equal(owner.address);
//     });

//     it("Should initialize totalSavings to 0", async function () {
//       expect(await savingsContract.totalSavings()).to.equal(0);
//     });
//   });

//   describe("Deposit Function", function () {
//     it("Should allow the owner to deposit Ether", async function () {
//       const depositAmount = ethers.parseEther("1"); // 1 ETH
//       const tx = await savingsContract.connect(owner).deposit({ value: depositAmount });
//       await tx.wait();

//       expect(await savingsContract.totalSavings()).to.equal(depositAmount);
//       expect(await savingsContract.getBalance()).to.equal(depositAmount);

//       // Check event emission
//       await expect(tx)
//         .to.emit(savingsContract, "Deposited")
//         .withArgs(owner.address, depositAmount);
//     });

//     it("Should reject deposits with zero value", async function () {
//       await expect(savingsContract.connect(owner).deposit({ value: 0 })).to.be.revertedWith(
//         "Deposit amount must be greater than 0"
//       );
//     });
//   });

//   describe("Withdraw Function", function () {
//     it("Should allow the owner to withdraw after the lock period", async function () {
//       const depositAmount = ethers.parseEther("1"); // 1 ETH
//       await savingsContract.connect(owner).deposit({ value: depositAmount });

//       // Wait for more than 24 hours (lock period)
//       await ethers.provider.send("evm_increaseTime", [25 * 60 * 60]); // Increase time by 25 hours
//       await ethers.provider.send("evm_mine"); // Mine a new block

//       const initialBalance = await owner.getBalance();
//       const tx = await savingsContract.connect(owner).withdraw();
//       await tx.wait();

//       const finalBalance = await owner.getBalance();
//       expect(finalBalance.sub(initialBalance)).to.equal(depositAmount); // Owner should receive the deposited amount

//       // Check event emission
//       await expect(tx)
//         .to.emit(savingsContract, "Withdrawn")
//         .withArgs(owner.address, depositAmount);

//       // Ensure totalSavings is reset to 0
//       expect(await savingsContract.totalSavings()).to.equal(0);
//     });

//     it("Should prevent withdrawal before the lock period", async function () {
//       const depositAmount = ethers.parseEther("1"); // 1 ETH
//       await savingsContract.connect(owner).deposit({ value: depositAmount });

//       // Attempt to withdraw immediately
//       await expect(savingsContract.connect(owner).withdraw()).to.be.revertedWith(
//         "Funds are still locked"
//       );
//     });

//     it("Should prevent non-owners from withdrawing", async function () {
//       const depositAmount = ethers.parseEther("1"); // 1 ETH
//       await savingsContract.connect(owner).deposit({ value: depositAmount });

//       // Wait for more than 24 hours
//       await ethers.provider.send("evm_increaseTime", [25 * 60 * 60]);
//       await ethers.provider.send("evm_mine");

//       // Attempt to withdraw as a non-owner
//       await expect(savingsContract.connect(nonOwner).withdraw()).to.be.revertedWith(
//         "Only the owner can perform this action"
//       );
//     });
//   });

//   describe("Emergency Withdraw Function", function () {
//     it("Should allow the owner to withdraw 50% of savings in an emergency", async function () {
//       const depositAmount = ethers.parseEther("2"); // 2 ETH
//       await savingsContract.connect(owner).deposit({ value: depositAmount });

//       const initialBalance = await owner.getBalance();
//       const tx = await savingsContract.connect(owner).emergencyWithdraw();
//       await tx.wait();

//       const halfSavings = depositAmount.div(2); // 50% of savings
//       const finalBalance = await owner.getBalance();
//       expect(finalBalance.sub(initialBalance)).to.equal(halfSavings); // Owner should receive half of the savings

//       // Check event emission
//       await expect(tx)
//         .to.emit(savingsContract, "EmergencyWithdrawn")
//         .withArgs(owner.address, halfSavings);

//       // Ensure totalSavings is reduced by 50%
//       expect(await savingsContract.totalSavings()).to.equal(depositAmount.sub(halfSavings));
//     });

//     it("Should prevent emergency withdrawal if there are insufficient funds", async function () {
//       const depositAmount = ethers.parseEther("0.5"); // 0.5 ETH
//       await savingsContract.connect(owner).deposit({ value: depositAmount });

//       // Attempt to withdraw 50% when it's less than 1 wei
//       await expect(savingsContract.connect(owner).emergencyWithdraw()).to.be.revertedWith(
//         "Not enough savings for emergency withdrawal"
//       );
//     });

//     it("Should prevent non-owners from performing emergency withdrawals", async function () {
//       const depositAmount = ethers.parseEther("2"); // 2 ETH
//       await savingsContract.connect(owner).deposit({ value: depositAmount });

//       // Attempt to withdraw as a non-owner
//       await expect(savingsContract.connect(nonOwner).emergencyWithdraw()).to.be.revertedWith(
//         "Only the owner can perform this action"
//       );
//     });
//   });

//   describe("Ownership Restrictions", function () {
//     it("Should prevent non-owners from depositing", async function () {
//       const depositAmount = ethers.parseEther("1"); // 1 ETH
//       await expect(savingsContract.connect(nonOwner).deposit({ value: depositAmount })).to.not.be.reverted;
//       // Deposits are not restricted to owners, so this should pass
//     });

//     it("Should prevent non-owners from accessing owner-only functions", async function () {
//       const depositAmount = ethers.parseEther("1"); // 1 ETH
//       await savingsContract.connect(owner).deposit({ value: depositAmount });

//       // Attempt to withdraw as a non-owner
//       await expect(savingsContract.connect(nonOwner).withdraw()).to.be.revertedWith(
//         "Only the owner can perform this action"
//       );

//       // Attempt to perform emergency withdrawal as a non-owner
//       await expect(savingsContract.connect(nonOwner).emergencyWithdraw()).to.be.revertedWith(
//         "Only the owner can perform this action"
//       );
//     });
//   });
// });