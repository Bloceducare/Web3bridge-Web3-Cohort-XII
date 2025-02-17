// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

contract Wallet {
    // owns the wallet and can send funds
    address payable owner;
    // keeps track of how much each person is all
    mapping(address => uint) public allowance;

    // decides if a person is allowed to send
    mapping(address => bool) public isAllowedToSend;
    mapping(address => bool) public isGuardian;
    address payable nextOwner;
    uint guardiansResetCount;
    uint public constant confirmationsFromGuardiansForReset = 2;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    modifier onlyGuardian() {
        require(isGuardian[msg.sender], "Not a guardian");
        _;
    }

    constructor() {
        owner = payable(msg.sender);
    }

    //  a guardian calls this function to suggest a new owner
    function proposeNewOwner(address payable newOwner) public onlyGuardian {
        require(isGuardian[msg.sender], "You are not a guardian, aborting!");

        if (nextOwner != newOwner) {
            nextOwner = newOwner;
            guardiansResetCount = 0;
        }

        guardiansResetCount++;

        if (guardiansResetCount >= confirmationsFromGuardiansForReset) {
            owner = nextOwner;
            nextOwner = payable(address(0));
        }
    }

    function setAllowance(address _from, uint _amount) public onlyOwner {
        require(msg.sender == owner, "You are not the owner, aborting!");
        allowance[_from] = _amount;
        isAllowedToSend[_from] = true;
    }

    function denySending(address _from) public onlyOwner {
        require(msg.sender == owner, "You are not the owner, aborting!");
        isAllowedToSend[_from] = false;
    }

    function transfer(
        address payable _to,
        uint _amount,
        bytes memory payload
    ) public returns (bytes memory) {
        require(
            _amount <= address(this).balance,
            "Can't send more than the contract owns, aborting."
        );

        if (msg.sender != owner) {
            require(
                isAllowedToSend[msg.sender],
                "You are not allowed to send any transactions, aborting"
            );
            require(
                allowance[msg.sender] >= _amount,
                "You are trying to send more than you are allowed to, aborting"
            );
            allowance[msg.sender] -= _amount;
        }

        (bool success, bytes memory returnData) = _to.call{value: _amount}(
            payload
        );
        require(success, "Transaction failed, aborting");
        return returnData;
    }

    receive() external payable {}

    // closing brace for the Wallet contract
}
