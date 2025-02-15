// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ScholarshipFund {
    address public owner;
    mapping(address => uint256) public donations;
    mapping(address => uint256) public scholarships;
    uint256 public totalFunds;

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function donate() external payable {
        require(msg.value > 0, "Donation must be greater than 0");
        donations[msg.sender] += msg.value;
        totalFunds += msg.value;
    }

    function awardScholarship(address student, uint256 amount) external onlyOwner {
        require(student != address(0), "Invalid student address");
        require(amount > 0, "Scholarship amount must be greater than 0");
        require(amount <= address(this).balance, "Insufficient funds in contract");

        scholarships[student] += amount;
        totalFunds -= amount;
        payable(student).transfer(amount);
    }

    function getScholarshipAmount(address student) external view returns (uint256) {
        return scholarships[student];
    }

    function getDonation(address donor) external view returns (uint256) {
        return donations[donor];
    }

    function withdraw() external onlyOwner {
        require(address(this).balance > 0, "No funds available");
        payable(owner).transfer(address(this).balance);
    }
}