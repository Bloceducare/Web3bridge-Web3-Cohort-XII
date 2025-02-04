// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract InheritanceWill {
    address public father;
    address public son;
    uint256 public unlockTime; // Time when son can access the inheritance
    bool public isDeceased;

    struct Will {
        uint256 amount;
        bool withdrawn;
    }

    mapping(address => Will) public inheritances;

    event FundsDeposited(address indexed father, uint256 amount);
    event InheritanceUnlocked(uint256 unlockTime);
    event InheritanceWithdrawn(address indexed son, uint256 amount);

    // Modifiers
    modifier onlyFather() {
        require(msg.sender == father, "Only the father can perform this action");
        _;
    }

    modifier onlySon() {
        require(msg.sender == son, "Only the son can perform this action");
        _;
    }

    modifier fatherDeceased() {
        require(isDeceased, "Father is still alive");
        require(block.timestamp >= unlockTime, "Inheritance is not yet available");
        _;
    }

    constructor(address _son, uint256 _unlockDelay) payable {
        require(_son != address(0), "Invalid son address");
        require(_unlockDelay > 0, "Unlock delay must be greater than zero");
        require(msg.value > 0, "Initial deposit required");

        father = msg.sender;
        son = _son;
        unlockTime = block.timestamp + _unlockDelay;
        isDeceased = false;

        inheritances[son] = Will(msg.value, false);

        emit FundsDeposited(msg.sender, msg.value);
    }

    function deposit() external payable onlyFather {
        require(msg.value > 0, "Must deposit a positive amount");
        inheritances[son].amount += msg.value;

        emit FundsDeposited(msg.sender, msg.value);
    }

    function declareDeath() external onlyFather {
        isDeceased = true;
        unlockTime = block.timestamp + 365 days; // Lock for 365 days after death

        emit InheritanceUnlocked(unlockTime);
    }

    function withdrawInheritance() external onlySon fatherDeceased {
        Will storage will = inheritances[msg.sender];
        require(!will.withdrawn, "Inheritance already withdrawn");
        require(will.amount > 0, "No inheritance available");

        will.withdrawn = true;
        payable(son).transfer(will.amount);

        emit InheritanceWithdrawn(msg.sender, will.amount);
    }

    function checkBalance() external view returns (uint256) {
        return address(this).balance;
    }
}