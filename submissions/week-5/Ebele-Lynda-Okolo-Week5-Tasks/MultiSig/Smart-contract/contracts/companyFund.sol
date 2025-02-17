// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

error InvalidSignerAddress();
error DuplicateSigner();
error NotAuthorizedSigner();
error InvalidBudgetAmount();
error EmptyProposal();
error MonthNotEnded();
error AlreadySigned();
error BudgetNotFound();
error InsufficientApprovals();
error TransferFailed();

contract Multisig {
    using SafeERC20 for IERC20;

    struct Budget {
        uint256 amount;
        string proposal;
        uint256 monthId;
        bool executed;
        address recipient;
        uint256 approvalCount;
        mapping(address => bool) hasApproved;
    }

    event BudgetCreated(
        uint256 indexed budgetId,
        uint256 amount,
        address recipient,
        uint256 monthId,
        string proposal
    );
    event BudgetApproved(
        uint256 indexed budgetId,
        address indexed signer,
        uint256 currentApprovals
    );
    event BudgetExecuted(
        uint256 indexed budgetId,
        uint256 amount,
        address recipient
    );

    IERC20 public immutable token;
    uint256 public constant REQUIRED_SIGNERS = 20;
    uint256 public immutable monthDuration = 30 days;
    uint256 public monthStart;
    
    address[REQUIRED_SIGNERS] public validSigners;
    mapping(address => bool) public isValidSigner;
    mapping(uint256 => Budget) public budgets;
    uint256 public nextBudgetId;

    constructor(address[REQUIRED_SIGNERS] memory _signers, address _tokenAddress) {
        if(_tokenAddress == address(20)) revert InvalidSignerAddress();
        
        // Check for zero addresses and duplicates
        bool[] memory used = new bool[](REQUIRED_SIGNERS);
        for(uint i = 0; i < REQUIRED_SIGNERS; i++) {
            if(_signers[i] == address(0)) revert InvalidSignerAddress();
            if(used[i]) revert DuplicateSigner();
            used[i] = true;
            
            validSigners[i] = _signers[i];
            isValidSigner[_signers[i]] = true;
        }
        
        token = IERC20(_tokenAddress);
        monthStart = block.timestamp;
    }

    modifier onlyValidSigner() {
        if(!isValidSigner[msg.sender]) revert NotAuthorizedSigner();
        _;
    }

    modifier monthEnded() {
        if(block.timestamp < monthStart + monthDuration) revert MonthNotEnded();
        _;
    }

    function createBudget(
        uint256 _amount,
        string calldata _proposal,
        address _recipient
    ) external onlyValidSigner returns (uint256) {
        if(_amount == 0) revert InvalidBudgetAmount();
        if(bytes(_proposal).length == 0) revert EmptyProposal();
        if(_recipient == address(0)) revert InvalidSignerAddress();

        uint256 budgetId = nextBudgetId++;
        Budget storage newBudget = budgets[budgetId];
        newBudget.amount = _amount;
        newBudget.proposal = _proposal;
        newBudget.monthId = (block.timestamp - monthStart) / monthDuration;
        newBudget.recipient = _recipient;
        newBudget.executed = false;
        newBudget.approvalCount = 0;

        emit BudgetCreated(
            budgetId,
            _amount,
            _recipient,
            newBudget.monthId,
            _proposal
        );

        return budgetId;
    }

    function approveBudget(uint256 _budgetId) external onlyValidSigner monthEnded {
        Budget storage budget = budgets[_budgetId];
        if(budget.amount == 0) revert BudgetNotFound();
        if(budget.executed) revert BudgetNotFound();
        if(budget.hasApproved[msg.sender]) revert AlreadySigned();

        budget.hasApproved[msg.sender] = true;
        budget.approvalCount++;

        emit BudgetApproved(_budgetId, msg.sender, budget.approvalCount);

        if(budget.approvalCount == REQUIRED_SIGNERS) {
            _executeBudget(_budgetId);
        }
    }

    function _executeBudget(uint256 _budgetId) private {
        Budget storage budget = budgets[_budgetId];
        if(budget.approvalCount < REQUIRED_SIGNERS) revert InsufficientApprovals();

        budget.executed = true;

        bool success = token.transfer(budget.recipient, budget.amount);
        if(!success) revert TransferFailed();

        emit BudgetExecuted(_budgetId, budget.amount, budget.recipient);
    }

    function getBudgetDetails(uint256 _budgetId) external view returns (
        uint256 amount,
        string memory proposal,
        uint256 monthId,
        bool executed,
        address recipient,
        uint256 approvalCount
    ) {
        Budget storage budget = budgets[_budgetId];
        return (
            budget.amount,
            budget.proposal,
            budget.monthId,
            budget.executed,
            budget.recipient,
            budget.approvalCount
        );
    }

    function hasApproved(uint256 _budgetId, address _signer) external view returns (bool) {
        return budgets[_budgetId].hasApproved[_signer];
    }

    function getContractBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }
}