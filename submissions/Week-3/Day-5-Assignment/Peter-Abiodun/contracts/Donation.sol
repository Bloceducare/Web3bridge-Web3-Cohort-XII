// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Donation {
    address public owner;
    mapping(address => uint256) public donations;
    uint256 public totalDonations;
    
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
        totalDonations += msg.value;
    }

    function withdraw() external onlyOwner {
        require(address(this).balance > 0, "No funds available");
        payable(owner).transfer(address(this).balance);
    }

    function getDonation(address donor) external view returns (uint256) {
        return donations[donor];
    }
}