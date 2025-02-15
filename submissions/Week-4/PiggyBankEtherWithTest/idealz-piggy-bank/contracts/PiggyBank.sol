// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract PiggyBank {
    address public owner;
    uint256 public totalSavings;
    uint256 public lockTime;
    
    event Deposit(address indexed sender, uint256 amount);
    event Withdrawal(address indexed owner, uint256 amount);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }
    
    modifier afterLockTime() {
        require(block.timestamp >= lockTime, "Cannot withdraw before lock time");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        lockTime = 1707974400; // Valentine's Day 2025 (February 14, 2025, UTC)
    }
    
    function deposit() public payable {
        require(msg.value > 0, "Deposit amount must be greater than zero");
        totalSavings += msg.value;
        emit Deposit(msg.sender, msg.value);
    }
    
    function withdraw(uint256 amount) public onlyOwner afterLockTime {
        require(amount <= totalSavings, "Insufficient funds");
        totalSavings -= amount;
        payable(owner).transfer(amount);
        emit Withdrawal(owner, amount);
    }
    
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
    
    function getTimeUntilUnlock() public view returns (uint256) {
        if (block.timestamp >= lockTime) {
            return 0;
        }
        return lockTime - block.timestamp;
    }
}
