// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract SavingsContract {
    address public owner; // The owner of the contract (you)
    uint256 public depositTimestamp; // Timestamp when the last deposit was made
    uint256 public lockPeriod = 24 hours; // Lock period for withdrawals (24 hours)
    uint256 public totalSavings; // Total amount saved in the contract

    event Deposited(address indexed depositor, uint256 amount);
    event Withdrawn(address indexed withdrawer, uint256 amount);
    event EmergencyWithdrawn(address indexed withdrawer, uint256 amount);

    constructor() {
        owner = msg.sender; // Set the contract deployer as the owner
    }

    /// @dev Function to deposit Ether into the contract
    function deposit() external payable {
        require(msg.value > 0, "Deposit amount must be greater than 0");
        totalSavings += msg.value;
        depositTimestamp = block.timestamp; // Update the deposit timestamp
        emit Deposited(msg.sender, msg.value);
    }

    /// @dev Function to withdraw all funds after the lock period
    function withdraw() external onlyOwner {
        require(block.timestamp >= depositTimestamp + lockPeriod, "Funds are still locked");
        uint256 amountToWithdraw = totalSavings;
        totalSavings = 0; // Reset savings to 0 after withdrawal
        payable(owner).transfer(amountToWithdraw);
        emit Withdrawn(owner, amountToWithdraw);
    }

    /// @dev Function to withdraw 50% of savings in case of an emergency
    function emergencyWithdraw() external onlyOwner {
        uint256 halfSavings = totalSavings / 2;
        require(halfSavings > 0, "Not enough savings for emergency withdrawal");
        totalSavings -= halfSavings; // Deduct 50% from total savings
        payable(owner).transfer(halfSavings);
        emit EmergencyWithdrawn(owner, halfSavings);
    }

    /// @dev Modifier to restrict access to the owner only
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    /// @dev Function to check the current balance of the contract
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}