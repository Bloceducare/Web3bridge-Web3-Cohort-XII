// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;
contract PiggyBank {
    address payable public owner;
    uint public withdrawalDate;
    mapping (address => uint) public deposits;
    bool transient locked;

    error WithdrawalTooEarly();
    error InsufficientFunds();
    error Unauthorized();

    constructor(uint _withdrawalDate) payable {
        owner = payable(msg.sender);
        withdrawalDate = _withdrawalDate;
    }

     modifier notFrozen() {
        _; //Placeholder for function body
    }

    modifier nonReentrant() {
        require(!locked, "Reentrancy attempt");
        locked = true;
        _;
        locked = false;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    function deposit() public payable {
        deposits[msg.sender] += msg.value;
    }

    function withdraw() public notFrozen nonReentrant {
        if (block.timestamp < withdrawalDate) {
            revert WithdrawalTooEarly();
        }
        uint amount = deposits[msg.sender];
        if (amount == 0) {
            revert InsufficientFunds();
        }
        deposits[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }

    function setWithdrawalDate(uint _withdrawalDate) public onlyOwner {
        withdrawalDate = _withdrawalDate;
    }
}