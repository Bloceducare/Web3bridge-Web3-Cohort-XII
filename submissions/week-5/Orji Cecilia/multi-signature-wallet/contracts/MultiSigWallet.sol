// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract BoardFundManager {

    error Unauthorized();
    error InvalidBoardSize();
    error InvalidTokenAddress();
    error DuplicateBoardMember();
    error TransactionNotFound();
    error TransactionAlreadyExecuted();
    error TransactionAlreadyApproved();
    error NoPriorApproval();
    error ApprovalRequired();
    error TransferFailed();

    event FundsDeposited(address indexed depositor, uint amount, uint newBalance);
    event TransactionSubmitted(address indexed initiator, uint indexed txID, address indexed target, uint amount, bytes payload);
    event TransactionConfirmed(address indexed approver, uint indexed txID);
    event ConfirmationRevoked(address indexed approver, uint indexed txID);
    event TransactionExecuted(address indexed executor, uint indexed txID);
    event FundsTransferred(address indexed target, uint amount);
    event TransactionApproval(address indexed approver, uint indexed txID, uint totalApprovals);

    IERC20 public token;
    address[] public boardMembers;
    mapping(address => bool) public isBoardMember;
    uint public requiredApprovals;

    struct PendingTransaction {
        address target;
        uint amount;
        bytes payload;
        bool hasBeenExecuted;
        uint approvalCount;
    }

    mapping(uint => mapping(address => bool)) public hasConfirmed;
    PendingTransaction[] public pendingTransactions;

    // 🔹 Modifiers
    modifier onlyBoardMember() {
        if (!isBoardMember[msg.sender]) revert Unauthorized();
        _;
    }

    modifier transactionExists(uint _txID) {
        if (_txID >= pendingTransactions.length) revert TransactionNotFound();
        _;
    }

    modifier notYetExecuted(uint _txID) {
        if (pendingTransactions[_txID].hasBeenExecuted) revert TransactionAlreadyExecuted();
        _;
    }

    modifier notYetConfirmed(uint _txID) {
        if (hasConfirmed[_txID][msg.sender]) revert TransactionAlreadyApproved();
        _;
    }

    constructor(address[] memory _members, address _token) {
        if (_members.length != 19) revert InvalidBoardSize(); 

        if (_token == address(0)) revert InvalidTokenAddress();
        token = IERC20(_token);
        requiredApprovals = 20; 

        isBoardMember[msg.sender] = true; 
        boardMembers.push(msg.sender);

        for (uint i = 0; i < _members.length; i++) {
            address member = _members[i];
            if (member == address(0)) revert InvalidTokenAddress();
            if (isBoardMember[member]) revert DuplicateBoardMember();

            isBoardMember[member] = true;
            boardMembers.push(member);
        }
    }

    /**
     * @notice Deposits ERC20 tokens into the contract.
     * @param _amount Amount of tokens to deposit.
     */
    function depositFunds(uint _amount) public onlyBoardMember {
        bool success = token.transferFrom(msg.sender, address(this), _amount);
        if (!success) revert TransferFailed();
        emit FundsDeposited(msg.sender, _amount, token.balanceOf(address(this)));
    }

    /**
     * @notice Creates a new transaction proposal.
     * @param _target Recipient of the transaction.
     * @param _amount Amount of ERC20 tokens to send.
     * @param _payload Additional calldata for contract interactions.
     */
    function addTransaction(address _target, uint _amount, bytes memory _payload) public onlyBoardMember {
        uint txID = pendingTransactions.length;
        pendingTransactions.push(PendingTransaction({
            target: _target,
            amount: _amount,
            payload: _payload,
            hasBeenExecuted: false,
            approvalCount: 0
        }));
        emit TransactionSubmitted(msg.sender, txID, _target, _amount, _payload);
    }

    /**
     * @notice Approves a transaction.
     * @param _txID ID of the transaction to approve.
     */
    function approveTransaction(uint _txID) 
        public onlyBoardMember transactionExists(_txID) notYetExecuted(_txID) notYetConfirmed(_txID) 
    {
        PendingTransaction storage pendingTx = pendingTransactions[_txID];

        pendingTx.approvalCount += 1;
        hasConfirmed[_txID][msg.sender] = true;

        emit TransactionApproval(msg.sender, _txID, pendingTx.approvalCount);
    }

    /**
     * @notice Executes an approved transaction.
     * @param _txID ID of the transaction to execute.
     */
    function runTransaction(uint _txID) public onlyBoardMember transactionExists(_txID) notYetExecuted(_txID) {
        PendingTransaction storage pendingTx = pendingTransactions[_txID];

        if (pendingTx.approvalCount < requiredApprovals) revert ApprovalRequired();

        pendingTx.hasBeenExecuted = true;

        emit TransactionExecuted(msg.sender, _txID);

        bool success = token.transfer(pendingTx.target, pendingTx.amount);
        if (!success) revert TransferFailed();

        emit FundsTransferred(pendingTx.target, pendingTx.amount);
    }

    /**
     * @notice Revokes a prior approval.
     * @param _txID ID of the transaction to revoke approval from.
     */
    function retractApproval(uint _txID) public onlyBoardMember transactionExists(_txID) notYetExecuted(_txID) {
        PendingTransaction storage pendingTx = pendingTransactions[_txID];

        if (!hasConfirmed[_txID][msg.sender]) revert NoPriorApproval(); // Fix: Changed to correct error
        pendingTx.approvalCount -= 1;
        hasConfirmed[_txID][msg.sender] = false;
        emit ConfirmationRevoked(msg.sender, _txID);
    }

    /**
     * @notice Returns the list of board members.
     * @return Array of board member addresses.
     */
    function getBoardMembers() public view returns (address[] memory) {
        return boardMembers; // Fix: Changed to return the correct array
    }

    /**
     * @notice Returns the total number of submitted transactions.
     * @return Total count of transactions.
     */
    function countTransactions() public view returns (uint) {
        return pendingTransactions.length;
    }

    /**
     * @notice Fetches transaction details.
     * @param _txID ID of the transaction to fetch.
     * @return target Address of the transaction recipient.
     * @return amount Amount of tokens to be sent.
     * @return payload Additional calldata.
     * @return hasBeenExecuted Boolean indicating if the transaction has been executed.
     * @return approvalCount Number of approvals received.
     */
    function fetchTransaction(uint _txID) public view 
        returns (address target, uint amount, bytes memory payload, bool hasBeenExecuted, uint approvalCount) 
    {
        if (_txID >= pendingTransactions.length) revert TransactionNotFound();
        PendingTransaction storage pendingTx = pendingTransactions[_txID];
        return (pendingTx.target, pendingTx.amount, pendingTx.payload, pendingTx.hasBeenExecuted, pendingTx.approvalCount);
    }
}
