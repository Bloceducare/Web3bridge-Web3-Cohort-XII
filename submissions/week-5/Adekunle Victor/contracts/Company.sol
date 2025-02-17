// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CompanyMultiSigners {
    IERC20 public token; 

    address[] public boardMembers;
    uint256 public requiredSignatures;
    mapping(address => bool) public isBoardMember;

    error BoardMembersRequired();
    error RequiredSignaturesTooHigh();
    error InvalidAddress();
    error AlreadyABoardMember();
    error NotABoardMember();
    error BudgetNotFound();
    error BudgetAlreadySigned();
    error BudgetNotFullySigned();
    error BudgetAlreadyReleased();
    error InsufficientBalance();
    error TransferFailed();

    struct Budget {
        string name;
        string description;
        uint256 amount;
        uint256 signedCount;
        bool isReleased;
        address recipient;
    }

    Budget[] public budgets;
    mapping(uint256 => mapping(address => bool)) public signed;
    uint256 public budgetCount;

    modifier onlyBoardMember() {
        if (!isBoardMember[msg.sender]) revert NotABoardMember();
        _;
    }

    modifier budgetExists(uint256 budgetId) {
        if (budgetId >= budgets.length) revert BudgetNotFound();
        _;
    }

    modifier notYetSigned(uint256 budgetId) {
        if (signed[budgetId][msg.sender]) revert BudgetAlreadySigned();
        _;
    }

    modifier notReleased(uint256 budgetId) {
        if (budgets[budgetId].isReleased) revert BudgetAlreadyReleased();
        _;
    }

    constructor(
        address[] memory _boardMembers,
        uint256 _requiredSignatures,
        address _tokenAddress
    ) {
        if (_boardMembers.length == 0) revert BoardMembersRequired();
        if (_requiredSignatures > _boardMembers.length) revert RequiredSignaturesTooHigh();

        for (uint i = 0; i < _boardMembers.length; i++) {
            address boardMember = _boardMembers[i];

            if (boardMember == address(0)) revert InvalidAddress();
            if (isBoardMember[boardMember]) revert AlreadyABoardMember();

            isBoardMember[boardMember] = true;
            boardMembers.push(boardMember);
        }

        requiredSignatures = _requiredSignatures;
        token = IERC20(_tokenAddress);
    }

    function createBudget(
        string memory _name,
        string memory _description, 
        uint256 _amount,
        address _recipient
    ) external onlyBoardMember {
        if (_recipient == address(0)) revert InvalidAddress();
        budgets.push(Budget({
            name: _name,
            description: _description,
            amount: _amount,
            signedCount: 0,
            isReleased: false,
            recipient: _recipient
        }));

        budgetCount++;
    }

    function signBudget(uint256 budgetId)
        external
        onlyBoardMember
        budgetExists(budgetId)
        notYetSigned(budgetId)
        notReleased(budgetId)
    {
        signed[budgetId][msg.sender] = true;
        budgets[budgetId].signedCount++;
    }

    function getSignedCount(uint256 budgetId) external view budgetExists(budgetId) returns (uint256) {
        return budgets[budgetId].signedCount;
    }

    function releaseFunds(uint256 budgetId) 
        external 
        onlyBoardMember 
        budgetExists(budgetId) 
        notReleased(budgetId) 
    {
        Budget storage budget = budgets[budgetId];

        if (budget.signedCount < requiredSignatures) revert BudgetNotFullySigned();
        if (token.balanceOf(address(this)) < budget.amount) revert InsufficientBalance();

        budget.isReleased = true;

        bool success = token.transfer(budget.recipient, budget.amount);
        if (!success) revert TransferFailed();
    }

    function depositFunds(uint256 amount) external {
        require(token.transferFrom(msg.sender, address(this), amount), "Deposit failed");
    }

    function getContractBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }
}
