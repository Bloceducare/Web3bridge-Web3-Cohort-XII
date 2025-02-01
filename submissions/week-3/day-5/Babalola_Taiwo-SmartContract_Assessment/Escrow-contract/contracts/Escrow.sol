// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Escrow {

    error InvalidAmount();
    error NotBuyer();
    error NotSeller();
    error InvalidState();
    error TransferFailed();


    struct Transaction {
        address payable buyer;
        address payable seller;
        uint256 amount;
        bool isDeposited;
        bool isConfirmed;
        bool isDisputed;
        string itemDescription;
    }


    mapping(uint256 => Transaction) public transactions;
    uint256 public transactionCount;
    address public owner;


    event TransactionCreated(uint256 indexed transactionId, address buyer, address seller, uint256 amount);
    event FundsDeposited(uint256 indexed transactionId, uint256 amount);
    event TransactionConfirmed(uint256 indexed transactionId);
    event DisputeRaised(uint256 indexed transactionId, string reason);
    event RefundIssued(uint256 indexed transactionId);

 
    constructor() {
        owner = msg.sender;
    }


    modifier onlyBuyer(uint256 _transactionId) {
        if (msg.sender != transactions[_transactionId].buyer) revert NotBuyer();
        _;
    }

    modifier onlySeller(uint256 _transactionId) {
        if (msg.sender != transactions[_transactionId].seller) revert NotSeller();
        _;
    }

    modifier validState(uint256 _transactionId, bool _deposited, bool _confirmed, bool _disputed) {
        Transaction memory transaction = transactions[_transactionId];
        if (transaction.isDeposited != _deposited || 
            transaction.isConfirmed != _confirmed || 
            transaction.isDisputed != _disputed) revert InvalidState();
        _;
    }


    function createTransaction(address payable _seller, string memory _itemDescription) external returns (uint256) {
        uint256 transactionId = transactionCount++;
        
        transactions[transactionId] = Transaction({
            buyer: payable(msg.sender),
            seller: _seller,
            amount: 0,
            isDeposited: false,
            isConfirmed: false,
            isDisputed: false,
            itemDescription: _itemDescription
        });

        emit TransactionCreated(transactionId, msg.sender, _seller, 0);
        return transactionId;
    }

    function deposit(uint256 _transactionId) 
        external 
        payable 
        onlyBuyer(_transactionId)
        validState(_transactionId, false, false, false)
    {
        if (msg.value == 0) revert InvalidAmount();

        Transaction storage transaction = transactions[_transactionId];
        transaction.amount = msg.value;
        transaction.isDeposited = true;

        emit FundsDeposited(_transactionId, msg.value);
    }

    function confirmReceipt(uint256 _transactionId) 
        external 
        onlyBuyer(_transactionId)
        validState(_transactionId, true, false, false)
    {
        Transaction storage transaction = transactions[_transactionId];
        transaction.isConfirmed = true;

        (bool success, ) = transaction.seller.call{value: transaction.amount}("");
        if (!success) revert TransferFailed();

        emit TransactionConfirmed(_transactionId);
    }

    function raiseDispute(uint256 _transactionId, string memory _reason) 
        external 
        onlyBuyer(_transactionId)
        validState(_transactionId, true, false, false)
    {
        Transaction storage transaction = transactions[_transactionId];
        transaction.isDisputed = true;

        emit DisputeRaised(_transactionId, _reason);
    }

    function refund(uint256 _transactionId) 
        external 
        onlySeller(_transactionId)
        validState(_transactionId, true, false, true)
    {
        Transaction storage transaction = transactions[_transactionId];
        transaction.isConfirmed = true; // Mark as confirmed to prevent further actions

        (bool success, ) = transaction.buyer.call{value: transaction.amount}("");
        if (!success) revert TransferFailed();

        emit RefundIssued(_transactionId);
    }

    function getTransaction(uint256 _transactionId) external view returns (Transaction memory) {
        return transactions[_transactionId];
    }
}