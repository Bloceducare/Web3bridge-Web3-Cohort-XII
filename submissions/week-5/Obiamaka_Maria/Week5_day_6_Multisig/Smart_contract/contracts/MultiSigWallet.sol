// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MultiSigWallet {
    error NotABoardMember();
    error RequiresExactly20Members();
    error InsufficientFunds();
    error ExpenseAlreadyExecuted();
    error AlreadyApproved();
    error NotFullyApproved();

    address[] public boardMembers;
    uint public totalFunds;
    struct Expense {
        uint amount;
        address payable recipient;
        mapping(address => bool) approvals;
        uint approvalCount;
        bool executed;
    }
    
    mapping(uint => Expense) public expenses;
    uint public expenseCount;
    
    modifier onlyBoardMember() {
        if (!isBoardMember(msg.sender)) revert NotABoardMember();
        _;
    }
    
    constructor(address[] memory _members) {
        if (_members.length != 20) revert RequiresExactly20Members();
        boardMembers = _members;
    }
    
    function isBoardMember(address _addr) public view returns (bool) {
        for (uint i = 0; i < boardMembers.length; i++) {
            if (boardMembers[i] == _addr) {
                return true;
            }
        }
        return false;
    }
    
    function deposit() external payable {
        totalFunds += msg.value;
    }
    
    function proposeExpense(uint _amount, address payable _recipient) external onlyBoardMember {
        if (_amount > totalFunds) revert InsufficientFunds();
        Expense storage newExpense = expenses[expenseCount++];
        newExpense.amount = _amount;
        newExpense.recipient = _recipient;
        newExpense.executed = false;
    }
    
    function approveExpense(uint _expenseId) external onlyBoardMember {
        Expense storage expense = expenses[_expenseId];
        if (expense.executed) revert ExpenseAlreadyExecuted();
        if (expense.approvals[msg.sender]) revert AlreadyApproved();
        
        expense.approvals[msg.sender] = true;
        expense.approvalCount++;
    }
    
    function releaseFunds(uint _expenseId) external onlyBoardMember {
        Expense storage expense = expenses[_expenseId];
        if (expense.executed) revert ExpenseAlreadyExecuted();
        if (expense.approvalCount != boardMembers.length) revert NotFullyApproved();
        
        expense.executed = true;
        totalFunds -= expense.amount;
        expense.recipient.transfer(expense.amount);
    }
    
    function getBoardMembers() external view returns (address[] memory) {
        return boardMembers;
    }

    function getApprovals(uint256 _expenseId) public view returns(bool) {
        return expenses[_expenseId].approvals[msg.sender];
         
    }


    
}