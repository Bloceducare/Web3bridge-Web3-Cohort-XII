// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SavingsContract {
    struct SavingsPlan {
        uint256 balance;
        uint256 goal;
        uint256 unlockTime;
    }

    mapping(address => SavingsPlan) private savings;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event SavingsGoalSet(
        address indexed user,
        uint256 goal,
        uint256 unlockTime
    );

    function setSavingsGoal(uint256 _goal, uint256 _timeInDays) external {
        require(_goal > 0, "Goal must be greater than zero");
        require(_timeInDays > 0, "Time must be greater than zero");
        require(
            savings[msg.sender].balance == 0,
            "Cannot change goal after deposit"
        );

        savings[msg.sender].goal = _goal;
        savings[msg.sender].unlockTime =
            block.timestamp +
            (_timeInDays * 1 days);

        emit SavingsGoalSet(msg.sender, _goal, savings[msg.sender].unlockTime);
    }

    function deposit() external payable {
        require(msg.value > 0, "Deposit amount must be greater than zero");
        savings[msg.sender].balance += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    function withdraw() external {
        SavingsPlan storage userSavings = savings[msg.sender];
        require(block.timestamp >= userSavings.unlockTime, "Funds are locked");
        require(
            userSavings.balance >= userSavings.goal,
            "Savings goal not reached"
        );
        require(userSavings.balance > 0, "No funds to withdraw");

        uint256 amount = userSavings.balance;
        userSavings.balance = 0;
        payable(msg.sender).transfer(amount);

        emit Withdrawn(msg.sender, amount);
    }

    function getSavingsDetails()
        external
        view
        returns (uint256 balance, uint256 goal, uint256 unlockTime)
    {
        SavingsPlan memory userSavings = savings[msg.sender];
        return (userSavings.balance, userSavings.goal, userSavings.unlockTime);
    }
}