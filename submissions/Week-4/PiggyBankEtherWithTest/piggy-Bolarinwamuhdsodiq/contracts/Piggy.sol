// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract PiggyBankMine {
    struct User {
        uint256 balance;
        uint256 target;
    }

    mapping(address => User) public users;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event TargetSet(address indexed user, uint256 target);

    function deposit() public payable {
        require(msg.value > 0, "You must deposit some Ether");
        users[msg.sender].balance += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) public {
        require(amount > 0, "You must withdraw amount greater than 0");
        require(users[msg.sender].balance >= amount, "Insufficient balance");

        users[msg.sender].balance -= amount;
        payable(msg.sender).transfer(amount);
        emit Withdrawn(msg.sender, amount);
    }

    function setTarget(uint256 target) public {
        users[msg.sender].target = target;
        emit TargetSet(msg.sender, target);
    }

    function checkBalance(address user) public view returns (uint256) {
        return users[user].balance;
    }
}
