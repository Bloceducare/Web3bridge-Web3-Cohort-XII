// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract ExpenseTracker {
    struct Expense {
        uint256 id;
        string description;
        uint256 amount;
        bool isPaid;
    }

    uint256 private expenseCounter;
    mapping(uint256 => Expense) private expenses;

    event ExpenseAdded(uint256 expenseId, string description, uint256 amount);
    event ExpenseUpdated(uint256 expenseId, string newDescription, uint256 newAmount);
    event ExpensePaid(uint256 expenseId);
    event ExpenseDeleted(uint256 expenseId);

    // Function 1: Add a new expense
    function addExpense(string calldata _description, uint256 _amount) public {
        require(_amount > 0, "Amount must be greater than zero");

        expenseCounter++;
        expenses[expenseCounter] = Expense(expenseCounter, _description, _amount, false);

        emit ExpenseAdded(expenseCounter, _description, _amount);
    }

    // Function 2: Mark an expense as paid
    function markAsPaid(uint256 _expenseId) public {
        require(expenses[_expenseId].id != 0, "Expense does not exist");
        require(!expenses[_expenseId].isPaid, "Expense is already paid");

        expenses[_expenseId].isPaid = true;
        emit ExpensePaid(_expenseId);
    }

    // Function 3: Update an expense
    function updateExpense(uint256 _expenseId, string calldata _newDescription, uint256 _newAmount) public {
        require(expenses[_expenseId].id != 0, "Expense does not exist");
        require(_newAmount > 0, "Amount must be greater than zero");

        expenses[_expenseId].description = _newDescription;
        expenses[_expenseId].amount = _newAmount;
        emit ExpenseUpdated(_expenseId, _newDescription, _newAmount);
    }

    // Function 4: Delete an expense
    function deleteExpense(uint256 _expenseId) public {
        require(expenses[_expenseId].id != 0, "Expense does not exist");

        delete expenses[_expenseId];
        emit ExpenseDeleted(_expenseId);
    }

    // Function 5: Get expense details
    function getExpense(uint256 _expenseId) public view returns (uint256, string memory, uint256, bool) {
        require(expenses[_expenseId].id != 0, "Expense does not exist");

        Expense memory e = expenses[_expenseId];
        return (e.id, e.description, e.amount, e.isPaid);
    }
}
