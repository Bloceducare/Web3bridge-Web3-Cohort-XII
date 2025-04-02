// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract MyPiggyBank {
  address public owner;
  uint256 public balance;
  uint256 public unlockTime;
  uint256 public targetAmount ; 

  event Deposit(address indexed sender, uint256 amount);
  event Withdrawal(address indexed receiver, uint256 amount);
  
  constructor(uint256 _lockDuration) payable {
    owner = msg.sender;
    balance = msg.value; // msg.value is the amount of ether sent to the contract
    unlockTime = block.timestamp + _lockDuration;
  }

  function deposit() external payable {
    require(msg.value > 0, "Deposit must be greater than 0");
    balance += msg.value;
    emit Deposit(msg.sender, msg.value);
  }

  function withdraw(uint256 amount) external {
    require(msg.sender == owner, "Only owner can withdraw");
    require(amount <= balance, "Insufficient balance"); // check if the amount to withdraw is less than the balance
    
    require(block.timestamp >= unlockTime || balance >= targetAmount, "Funds are locked and threshold not met");

    balance -= amount;
    payable(msg.sender).transfer(amount); // transfer the amount to the owner
    emit Withdrawal(msg.sender, amount);
  }

  function getBalance() external view returns (uint256) {
    return address(this).balance; // this means the contract address
  }
}