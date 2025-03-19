// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract ValSafeLock {
    address public owner;
    uint256 public unlockTime;

    event DepositSuccessful(address indexed sender, uint256 amount);
    event WithdrawalSuccessful(address indexed receiver, uint256 amount);

    constructor() {
        owner = msg.sender;
        unlockTime = getValentinesDay(block.timestamp);
    }

    function getValentinesDay(uint256 currentTime) internal pure returns (uint256) {
        uint256 year = 1970 + currentTime / 31556926;
        return (year - 1970) * 31556926 + 44 * 86400;
    }

    function deposit() external payable {
        require(msg.value > 0, "Must deposit some Ether");
        emit DepositSuccessful(msg.sender, msg.value);
    }

    function withdraw() external {
        require(msg.sender == owner, "Only owner can withdraw");
        require(block.timestamp >= unlockTime && block.timestamp < unlockTime + 1 days, "Can only withdraw on Valentine's Day");
        require(address(this).balance > 0, "No balance to withdraw");
        
        uint256 balance = address(this).balance;
        (bool success, ) = owner.call{value: balance}("");
        require(success, "Transfer failed");
        
        emit WithdrawalSuccessful(owner, balance);
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
