// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleDonation {
    address public owner;
    uint256 public totalBalance;

    struct Donation {
      string name;
      uint256 balance;
      address starter;
    }

    mapping(string => Donation) public donations;
    mapping(string => mapping(address => uint256)) public funders;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    modifier onlyStarter(string calldata _name) {
      require(msg.sender == donations[_name].starter, "Not donation starter");
      _;
    }

    constructor() {
        owner = msg.sender;
        totalBalance = 0;
    }

    function createDonation(string calldata donationName) public returns(Donation memory){
        require(donations[donationName].starter == address(0) , "A donation with this name exists");
        donations[donationName] = Donation(donationName, 0, msg.sender);
        return donations[donationName];
    }

    function donate(string calldata donationName, uint256 amount) public returns(Donation memory){
        require(donations[donationName].starter != address(0) , "A donation with this name does not exists");
        require(amount > 0, "Must send atleast 1ETH");
        funders[donationName][msg.sender] += amount;
        donations[donationName].balance += amount;
        totalBalance += amount;
        return donations[donationName];
    }

    function getBalance(string calldata donationName) external view returns (uint) {
        return donations[donationName].balance;
    }

    function withdraw(string calldata donationName) external onlyStarter(donationName) returns(uint) {
        uint amount = donations[donationName].balance;
        require(amount > 0, "No funds available");

        donations[donationName].balance = 0;
        totalBalance -= amount;
        return amount;
    }

    function deleteDonation(string calldata donationName) onlyOwner public {
        delete donations[donationName];
    }
}
