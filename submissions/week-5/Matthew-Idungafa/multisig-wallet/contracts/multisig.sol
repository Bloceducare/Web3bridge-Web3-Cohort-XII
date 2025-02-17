// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract CompanyFundManager {
    error NotBoardMember();
    error BudgetProposalNotFound();
    error BudgetAlreadyExecuted();
    error AlreadyApproved();
    error InvalidBoardMemberCount();
    error InvalidBoardMember();
    error DuplicateBoardMember();
    error InsufficientApprovals(); 
    error BudgetExecutionFailed();
    error NotYetApproved();

    event FundsDeposited(address indexed depositor, uint256 amount, uint256 totalBalance);
    event BudgetProposed(
        address indexed boardMember,
        uint256 indexed budgetId,
        address indexed recipient,
        uint256 amount,
        bytes description
    );
    event BudgetApproved(address indexed boardMember, uint256 indexed budgetId);
    event ApprovalRevoked(address indexed boardMember, uint256 indexed budgetId);
    event BudgetExecuted(address indexed executor, uint256 indexed budgetId);

    address[] public boardMembers;
    mapping(address => bool) public isBoardMember;
    uint256 public constant TOTAL_BOARD_MEMBERS = 20;
    uint256 public constant REQUIRED_APPROVALS = 20; // All members must approve

    struct BudgetProposal {
        address recipient;
        uint256 amount;
        bytes description;
        bool executed;
        uint256 approvalCount;
    }

    // mapping from budgetId => boardMember => bool
    mapping(uint256 => mapping(address => bool)) public hasApproved;

    BudgetProposal[] public budgetProposals;

    modifier onlyBoardMember() {
        if (!isBoardMember[msg.sender]) {
            revert NotBoardMember();
        }
        _;
    }

    modifier budgetExists(uint256 _budgetId) {
        if (_budgetId >= budgetProposals.length) {
            revert BudgetProposalNotFound();
        }
        _;
    }

    modifier notExecuted(uint256 _budgetId) {
        if (budgetProposals[_budgetId].executed) {
            revert BudgetAlreadyExecuted();
        }
        _;
    }

    modifier notApproved(uint256 _budgetId) {
        if (hasApproved[_budgetId][msg.sender]) {
            revert AlreadyApproved();
        }
        _;
    }

    constructor(address[] memory _boardMembers) {
        if (_boardMembers.length != TOTAL_BOARD_MEMBERS) {
            revert InvalidBoardMemberCount();
        }

        for (uint256 i = 0; i < _boardMembers.length; i++) {
            address member = _boardMembers[i];

            if (member == address(0)) {
                revert InvalidBoardMember();
            }
            if (isBoardMember[member]) {
                revert DuplicateBoardMember();
            }

            isBoardMember[member] = true;
            boardMembers.push(member);
        }
    }

    receive() external payable {
        emit FundsDeposited(msg.sender, msg.value, address(this).balance);
    }

    function proposeBudget(
        address _recipient,
        uint256 _amount,
        bytes memory _description
    ) public onlyBoardMember {
        uint256 budgetId = budgetProposals.length;

        budgetProposals.push(
            BudgetProposal({
                recipient: _recipient,
                amount: _amount,
                description: _description,
                executed: false,
                approvalCount: 0
            })
        );

        emit BudgetProposed(msg.sender, budgetId, _recipient, _amount, _description);
    }

    function approveBudget(uint256 _budgetId)
        public
        onlyBoardMember
        budgetExists(_budgetId)
        notExecuted(_budgetId)
        notApproved(_budgetId)
    {
        BudgetProposal storage proposal = budgetProposals[_budgetId];
        proposal.approvalCount += 1;
        hasApproved[_budgetId][msg.sender] = true;

        emit BudgetApproved(msg.sender, _budgetId);
    }

    function executeBudget(uint256 _budgetId)
        public
        onlyBoardMember
        budgetExists(_budgetId)
        notExecuted(_budgetId)
    {
        BudgetProposal storage proposal = budgetProposals[_budgetId];

        if (proposal.approvalCount != REQUIRED_APPROVALS) {
            revert InsufficientApprovals();
        }

        proposal.executed = true;

        (bool success,) = proposal.recipient.call{value: proposal.amount}("");
        if (!success) {
            revert BudgetExecutionFailed();
        }

        emit BudgetExecuted(msg.sender, _budgetId);
    }

    function revokeApproval(uint256 _budgetId)
        public
        onlyBoardMember
        budgetExists(_budgetId)
        notExecuted(_budgetId)
    {
        if (!hasApproved[_budgetId][msg.sender]) {
            revert NotYetApproved();
        }

        BudgetProposal storage proposal = budgetProposals[_budgetId];
        proposal.approvalCount -= 1;
        hasApproved[_budgetId][msg.sender] = false;

        emit ApprovalRevoked(msg.sender, _budgetId);
    }

    function getBoardMembers() public view returns (address[] memory) {
        return boardMembers;
    }

    function getBudgetCount() public view returns (uint256) {
        return budgetProposals.length;
    }

    function getBudgetProposal(uint256 _budgetId)
        public
        view
        returns (
            address recipient,
            uint256 amount,
            bytes memory description,
            bool executed,
            uint256 approvalCount
        )
    {
        if (_budgetId >= budgetProposals.length) {
            revert BudgetProposalNotFound();
        }

        BudgetProposal storage proposal = budgetProposals[_budgetId];

        return (
            proposal.recipient,
            proposal.amount,
            proposal.description,
            proposal.executed,
            proposal.approvalCount
        );
    }
}