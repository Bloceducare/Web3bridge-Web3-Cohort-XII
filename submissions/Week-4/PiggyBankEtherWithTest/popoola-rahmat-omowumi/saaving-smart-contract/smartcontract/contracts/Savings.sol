// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract SavingsLock {
    address public immutable owner;
    uint256 public unlockTime;
    uint256 public constant EMERGENCY_FEE_PERCENT = 10; 

    event Deposited(address indexed sender, uint256 amount);
    event Withdrawn(address indexed receiver, uint256 amount);
    event LockExtended(uint256 newUnlockTime);
    event EmergencyWithdrawal(address indexed receiver, uint256 amount, uint256 fee);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier isUnlocked() {
        require(block.timestamp >= unlockTime, "Funds are still locked");
        _;
    }

    constructor(uint256 _lockPeriodInSeconds) payable {
        require(_lockPeriodInSeconds > 0, "Lock period must be greater than zero");
        owner = msg.sender;
        unlockTime = block.timestamp + _lockPeriodInSeconds;
    }

    function deposit() external payable {
        require(msg.sender != address(0), "Invalid Address");
        require(msg.value > 0, "Deposit amount must be greater than zero");
        emit Deposited(msg.sender, msg.value);
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function timeUntilUnlock() external view returns (uint256) {
        return unlockTime > block.timestamp ? unlockTime - block.timestamp : 0;
    }

    function withdraw(uint256 _amount) external onlyOwner isUnlocked {
        uint256 contractBalance = address(this).balance;
        require(_amount > 0, "Withdrawal amount must be greater than zero");
        require(_amount <= contractBalance, "Insufficient balance in contract");

        payable(owner).transfer(_amount);
        emit Withdrawn(owner, _amount);
    }

    function extendLock(uint256 additionalSeconds) external onlyOwner {
        require(additionalSeconds > 0, "Extension must be greater than zero");
        unlockTime += additionalSeconds;
        emit LockExtended(unlockTime);
    }

    function emergencyWithdraw() external onlyOwner {
        uint256 contractBalance = address(this).balance;
        require(contractBalance > 0, "No funds to withdraw");

        uint256 fee = (contractBalance * EMERGENCY_FEE_PERCENT) / 100;
        uint256 amountAfterFee = contractBalance - fee;

        payable(owner).transfer(amountAfterFee);
        
        unlockTime = block.timestamp;

        emit EmergencyWithdrawal(owner, amountAfterFee, fee);
    }
}
