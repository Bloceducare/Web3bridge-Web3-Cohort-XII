// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

contract PiggyBank{
    address public manager;
    uint256 public balance;
    uint256 public unlockTime;

    event Deposit(address indexed depositor, uint256 amount);
    event Withdraw(address indexed withdrawer, uint256 amount);

    constructor(uint256 _unlockTime) {
        manager = msg.sender;
        balance = 0;
        unlockTime = _unlockTime;
    }

    function deposit() public payable {
        require(msg.value > 0, "Deposit amount must be greater than 0");
        balance += msg.value;
        emit Deposit(msg.sender, msg.value); 
    }

    function withdraw(uint256 _amount) public {
        require(msg.sender == manager, "Only the manager can withdraw funds");
        require(block.timestamp >= unlockTime, "Savings still locked");
        require(_amount <= balance, "Insufficient balance");
        require(_amount > 0, "Withdrawal amount must be greater than 0");

        balance -= _amount;
        payable(manager).transfer(_amount);
        emit Withdraw(msg.sender, _amount);
    }

    function getBalance() public view returns (uint256) {
        return balance;
    }
}
