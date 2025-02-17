// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

contract PiggyBank {
    address public owner;

    struct PiggyDetails {
        uint256 deadline;
        uint256 pledgeAmount;
        bool withdrawn;
    }

    mapping(address => PiggyDetails) public piggyBanks;

    event MoneyLocked(address indexed user, uint256 amount, uint256 deadline);
    event MoneyWithdrawn(address indexed user, uint256 amount);

    modifier onlyDepositor() {
        require(piggyBanks[msg.sender].pledgeAmount > 0, "No active deposit");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function deposit(uint256 _deadline) external payable {
        require(_deadline > block.timestamp, "Deadline must be in the future");
        require(msg.value > 0, "Deposit amount must be greater than zero");
        require(piggyBanks[msg.sender].pledgeAmount == 0, "Existing deposit active");

        piggyBanks[msg.sender] = PiggyDetails(_deadline, msg.value, false);

        emit MoneyLocked(msg.sender, msg.value, _deadline);
    }

    function withdraw() external onlyDepositor {
        PiggyDetails storage piggy = piggyBanks[msg.sender];
        require(block.timestamp >= piggy.deadline, "Cannot withdraw before deadline");
        require(!piggy.withdrawn, "Already withdrawn");

        piggy.withdrawn = true;
        payable(msg.sender).transfer(piggy.pledgeAmount);

        emit MoneyWithdrawn(msg.sender, piggy.pledgeAmount);
    }

    function checkBalance() external view returns (uint256) {
        return piggyBanks[msg.sender].pledgeAmount;
    }
}
