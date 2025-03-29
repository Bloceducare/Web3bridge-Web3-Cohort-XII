//SPDX-License-Identifier:MIT
pragma solidity ^0.8.0;

contract OptimizedCompanyFundManager {
    // Structure to store monthly budget details
    struct MonthlyBudget {
        uint256 amount;
        uint256 timestamp;
        bool isActive;
        uint256 signaturesRequired;
        uint256 signatureCount;
        mapping(address => bool) hasSigned;
        bool isReleased;
    }

    // State variables
    address public admin;
    uint256 public boardMemberCount;
    mapping(address => bool) public isBoardMember;
    mapping(uint256 => MonthlyBudget) public monthlyBudgets;
    uint256 public currentMonthId;
    uint256 public constant BOARD_SIZE = 20;

    // Add a company treasury address
    address payable public companyTreasury;

    // Add a mapping to track released but unspent budget amounts
    mapping(uint256 => uint256) public unspentBudget;

    // Events
    event BudgetProposed(uint256 monthId, uint256 amount);
    event BudgetSigned(uint256 monthId, address signer);
    event FundsReleased(uint256 monthId, uint256 amount);
    event BoardMemberAdded(address member);
    event BoardMemberRemoved(address member);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    modifier onlyBoardMember() {
        require(
            isBoardMember[msg.sender],
            "Only board members can call this function"
        );
        _;
    }

    constructor(address payable _treasury) {
        admin = msg.sender;
        companyTreasury = _treasury;
    }

    // Function to add board members (only admin)
    function addBoardMember(address _member) external onlyAdmin {
        require(boardMemberCount < BOARD_SIZE, "Board is full");
        require(!isBoardMember[_member], "Member already exists");

        isBoardMember[_member] = true;
        boardMemberCount++;

        emit BoardMemberAdded(_member);
    }

    // Function to remove board members (only admin)
    function removeBoardMember(address _member) external onlyAdmin {
        require(isBoardMember[_member], "Member not found");

        isBoardMember[_member] = false;
        boardMemberCount--;

        emit BoardMemberRemoved(_member);
    }

    // Function to propose monthly budget
    function proposeBudget(uint256 _amount) external onlyAdmin {
        require(boardMemberCount > 0, "No board members registered");
        require(
            boardMemberCount == BOARD_SIZE,
            "Not all Board Members available"
        );

        currentMonthId++;
        MonthlyBudget storage newBudget = monthlyBudgets[currentMonthId];
        newBudget.amount = _amount;
        newBudget.timestamp = block.timestamp;
        newBudget.isActive = true;
        newBudget.signaturesRequired = boardMemberCount;
        newBudget.signatureCount = 0;
        newBudget.isReleased = false;

        emit BudgetProposed(currentMonthId, _amount);
    }

    // Function for board members to sign the budget
    function signBudget(uint256 _monthId) external onlyBoardMember {
        MonthlyBudget storage budget = monthlyBudgets[_monthId];
        require(budget.isActive, "Budget is not active");
        require(!budget.isReleased, "Budget already released");
        require(!budget.hasSigned[msg.sender], "Already signed");

        budget.hasSigned[msg.sender] = true;
        budget.signatureCount++;

        emit BudgetSigned(_monthId, msg.sender);

        // Check if all required signatures are collected
        if (budget.signatureCount == budget.signaturesRequired) {
            releaseFunds(_monthId);
        }
    }

    // Internal function to release funds
    function releaseFunds(uint256 _monthId) internal {
        MonthlyBudget storage budget = monthlyBudgets[_monthId];
        require(!budget.isReleased, "Funds already released");
        require(
            budget.signatureCount == budget.signaturesRequired,
            "Not enough signatures"
        );

        budget.isReleased = true;
        // Here you would implement the actual fund transfer logic

        emit FundsReleased(_monthId, budget.amount);
    }

    // Function to check if a board member has signed
    function hasSignedBudget(
        uint256 _monthId,
        address _member
    ) external view returns (bool) {
        return monthlyBudgets[_monthId].hasSigned[_member];
    }

    // Function to get number of signatures for a budget
    function getSignatureCount(
        uint256 _monthId
    ) external view returns (uint256) {
        return monthlyBudgets[_monthId].signatureCount;
    }

    // Function to check if budget is released
    function isBudgetReleased(uint256 _monthId) external view returns (bool) {
        return monthlyBudgets[_monthId].isReleased;
    }

    // Add funds withdrawal function
    function withdrawFunds(
        address payable _to,
        uint256 _amount
    ) external onlyAdmin {
        require(address(this).balance >= _amount, "Insufficient balance");
        require(
            monthlyBudgets[currentMonthId].isReleased,
            "Current budget not released"
        );

        _to.transfer(_amount);
    }

    // Function to receive funds
    receive() external payable {}

    // Function to get contract balance
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
