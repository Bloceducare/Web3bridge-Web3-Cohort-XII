// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract SimpleFundraiser {
    // owner: Stores the campaign creator (person who deployed the contract). ,goal: The funding goal, totalFunds: The total amount raised  & donations: A mapping to track who donated and how much.
    address public owner;
    uint256 public goal;
    uint256 public totalFunds;

    mapping(address => uint256) public donations;

    event DonationReceived(address indexed donor, uint256 amount);
    event FundsWithdrawn(address indexed owner, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner that deployed the SC can perform this action");
        _;
    }
    
    constructor(uint256 _goal) {
        // this is called once when the contract is deployed and it sets the owner and goal
        require(_goal > 0, "Goal must be greater than zero to start a fundraiser");
        owner = msg.sender;
        goal = _goal;
    }

    function donate() external payable {
        require(msg.value > 0, "Donation must be greater than zero"); // This checks is the donation is greater than zero

        donations[msg.sender] += msg.value;
        totalFunds += msg.value;

        emit DonationReceived(msg.sender, msg.value);
    }

    function withdrawFunds() external onlyOwner { // This function is only accessible by the owner
        require(totalFunds >= goal, "Funding goal not met"); // This checks if the goal is met before withdrawing the funds

        uint256 amount = totalFunds;
        totalFunds = 0;
        payable(owner).transfer(amount);

        emit FundsWithdrawn(owner, amount);
    }
}
