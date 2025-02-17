// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.28;

import "./IToken.sol";

contract MultiSig {
    struct Transaction{
        address destination;
        uint256 amount;
        uint256 signatureCount;
        mapping(address => bool) isSigned;
        bool isExecuted;
        uint256 initialTime;
        uint256 completionTime; 
    }
    // address public president;
    uint256 public nonce;
    uint256 public constant THRESHOLD = 20;
    mapping(address => bool) public isBoardMember;
    mapping(uint256 => Transaction) public transactions;
    address tokenAddress;

    event TransactionEvent(uint256 _txid, address destination, uint256 _amount);
    event SignTransactionEvent(address _signer, uint256 _id);
    event TansactionExecutedEvent(uint256 _txid, address _destination, uint256 _amount);
    event LiquidityAddedEvent(address _sender, uint256 _amount);

    error IncompleteBoardMembers();
    error Unathourized();
    error AlreadyExist();
    error Invalid();
    error InvalidAmount();
    error InvalidSignature();
    error AlreadySigned();
    error InvalidExecution();
    error InsufficientFunds();
    error InsufficientAllowance();


    constructor(address[] memory _boardMembers, address _tokenAddress) {
        if(_boardMembers.length != 20) revert IncompleteBoardMembers();
        tokenAddress = _tokenAddress;

        for (uint256 i = 0; i < THRESHOLD; i++) {
            address _owner = _boardMembers[i];
            if(_owner == address(0)) revert Unathourized();
            if(isBoardMember[_owner] == true) revert AlreadyExist();
            isBoardMember[_owner] = true;
        }
    }

    function initiateTransaction(address _destination, uint256 _amount) external returns (uint256) {
        if(isBoardMember[msg.sender] != true) revert Unathourized();

        uint256 _txid = nonce++;
        Transaction storage _transaction = transactions[_txid];
         
        _transaction.destination = _destination;
        _transaction.amount = _amount;
        _transaction.signatureCount = 0;
        _transaction.isExecuted = false;
        _transaction.initialTime= block.timestamp;
        _transaction.completionTime=0;


        emit TransactionEvent(_txid, _destination, _amount);
        return _txid;
    }

    function signTransaction(uint256 _txid) public returns (bool) {
        if(isBoardMember[msg.sender] != true) revert Unathourized();
        Transaction storage _transaction = transactions[_txid];
        if(_transaction.amount <= 0) revert InvalidAmount();
        // if(_transaction.signatureCount > 20) revert InvalidSignature();
        if(_transaction.isSigned[msg.sender] == true) revert AlreadySigned();
        if(_transaction.isExecuted == true) revert InvalidExecution();

        _transaction.signatureCount +=1;
        _transaction.isSigned[msg.sender] = true;

        if(_transaction.signatureCount == 20) {
            executeTransaction(_txid);
            _transaction.completionTime = block.timestamp;
            _transaction.isExecuted = true;
        
        }
        emit SignTransactionEvent(msg.sender, _txid);
        return true;


    }

    function executeTransaction(uint256 _txid) internal returns (bool) {
        if(isBoardMember[msg.sender] != true) revert Unathourized();
        Transaction storage _transaction = transactions[_txid];

        if(_transaction.isExecuted == true) revert InvalidExecution();

        IToken(tokenAddress).transfer(_transaction.destination, _transaction.amount);

        emit TansactionExecutedEvent(_txid, _transaction.destination, _transaction.amount);
        return true;

    }

    function addLiquidity(uint256 _amount) external returns(bool) {
        if(isBoardMember[msg.sender] != true) revert Unathourized();
        if(IToken(tokenAddress).balanceOf(msg.sender) < _amount) revert InsufficientFunds();
        if(IToken(tokenAddress).allowance(msg.sender, address(this)) < _amount) revert InsufficientAllowance();
        IToken(tokenAddress).transferFrom(msg.sender, address(this), _amount);

        emit LiquidityAddedEvent(msg.sender, _amount);

        return true;
    }
}