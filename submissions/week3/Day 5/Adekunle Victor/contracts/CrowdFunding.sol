// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract CrowdFunding {
    address public platformOwner;

    struct Campaign {
        string name;
        address payable owner;
        uint256 goal;
        uint256 amountRaised;
        uint256 deadline;
        bool withdrawn;
    }

    Campaign[] public campaigns;
    mapping(address => uint256) public contributions;

    constructor() {
        platformOwner = msg.sender;  
    }

    
    modifier onlyOwner(uint256 _id) {
        require(msg.sender == campaigns[_id].owner, "You are not the owner");
        _;
    }

    
    modifier campaignEnded(uint256 _id) {
        require(block.timestamp >= campaigns[_id].deadline, "Campaign still active");
        _;
    }

    
    function createCampaign(string memory _name, uint256 _goal, uint256 _duration) external {
        require(_goal > 0, "Dream Bigger than 0 ETH");

        Campaign memory newCampaign = Campaign({
            name: _name,
            owner: payable(msg.sender),
            goal: _goal,
            amountRaised: 0,
            deadline: block.timestamp + _duration,
            withdrawn: false
        });

        campaigns.push(newCampaign);  
    }

    
    function contribute(uint256 _id) external payable {
        require(msg.value > 0, "Must send ETH to contribute");
        require(block.timestamp < campaigns[_id].deadline, "Campaign ended");

        campaigns[_id].amountRaised += msg.value;
        contributions[msg.sender] += msg.value;
    }

   
    function withdrawFunds(uint256 _id) external onlyOwner(_id) campaignEnded(_id) {
        Campaign storage campaign = campaigns[_id];
        require(campaign.amountRaised >= campaign.goal, "Goal not reached");
        require(!campaign.withdrawn, "Funds already withdrawn");

        campaign.withdrawn = true;
        campaign.owner.transfer(campaign.amountRaised);
    }

    
    function claimRefund() external {
        uint256 contributed = contributions[msg.sender];
        require(contributed > 0, "No contributions found");

        contributions[msg.sender] = 0;
        payable(msg.sender).transfer(contributed);
    }
}
