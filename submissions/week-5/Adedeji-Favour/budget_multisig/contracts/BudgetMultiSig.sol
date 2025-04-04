// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

error ONLY_OWNER_HAS_ACCESS();
error ONLY_BOARD_MEMBERS_HAS_ACCESS();
error EXACT_20_BOARD_MEMBERS_REQUIRED();
error BUDGET_MUST_BE_GREATER_THAN_ZERO();
error FUNDS_ALREADY_RELEASED();
error NO_BUDGET_PROPOSED();
error ALREADY_SIGNED();
error NO_BUDGET_AVAILABLE();

contract BudgetMultiSig {
    address public owner;
    uint256 public currentMonth;
    uint256 public budgetAmount;
    bool public fundsReleased;

    struct Budget {
        uint256 amount;
        uint256 approvals;
        mapping(address => bool) hasSigned;
    }

    mapping(uint256 => Budget) private budgets;
    mapping(address => bool) public isBoardMember;
    uint256 public totalBoardMembers;

    event BudgetProposed(uint256 month, uint256 amount);
    event BudgetApproved(uint256 month, address member);
    event FundsReleased(uint256 month, uint256 amount);

    modifier onlyOwner() {
      if(msg.sender != owner) revert ONLY_OWNER_HAS_ACCESS();
      _;
    }

    modifier onlyBoardMember() {
      if(!isBoardMember[msg.sender]) revert ONLY_BOARD_MEMBERS_HAS_ACCESS();
        _;
    }

    constructor(address[] memory boardMembers) {
      if(boardMembers.length != 20) revert EXACT_20_BOARD_MEMBERS_REQUIRED();
        owner = msg.sender;
        totalBoardMembers = boardMembers.length;
        
        for (uint256 i = 0; i < boardMembers.length; i++) {
            isBoardMember[boardMembers[i]] = true;
        }
    }

    function proposeBudget(uint256 _amount) external onlyOwner {
      if(_amount == 0) revert BUDGET_MUST_BE_GREATER_THAN_ZERO();
      if(fundsReleased) revert FUNDS_ALREADY_RELEASED();

        currentMonth++;
        budgetAmount = _amount;
        fundsReleased = false;

        emit BudgetProposed(currentMonth, _amount);
    }

    function signBudget() external onlyBoardMember {
      if(budgetAmount == 0) revert NO_BUDGET_PROPOSED();

        Budget storage budget = budgets[currentMonth];
        if(budget.hasSigned[msg.sender]) revert ALREADY_SIGNED();

        budget.hasSigned[msg.sender] = true;
        budget.approvals++;

        emit BudgetApproved(currentMonth, msg.sender);

        if (budget.approvals == totalBoardMembers) {
            releaseFunds();
        }
    }

    function releaseFunds() internal {
      if(budgetAmount == 0) revert NO_BUDGET_AVAILABLE();
      if(fundsReleased) revert FUNDS_ALREADY_RELEASED();

        fundsReleased = true;
        emit FundsReleased(currentMonth, budgetAmount);
        
        budgetAmount = 0;
    }

    function depositFunds() external payable onlyOwner {}

    function getBudgetStatus() external view returns (uint256, uint256, bool) {
        return (budgetAmount, budgets[currentMonth].approvals, fundsReleased);
    }
}
