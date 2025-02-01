// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Crowdfunding {
    struct Campaign {
        uint id;
        string title;
        string description;
        address owner;
        uint goal;
        uint fundsRaised;
        bool isCompleted;
    }

    address public platformOwner;
    uint public campaignCounter;
    mapping(uint => Campaign) public campaigns;
    mapping(uint => mapping(address => uint)) public contributions;

    event CampaignCreated(uint campaignId, string title, address indexed owner, uint goal);
    event Funded(uint campaignId, address indexed contributor, uint amount);
    event CampaignCompleted(uint campaignId, uint totalFunds);
    
    modifier onlyPlatformOwner() {
        require(msg.sender == platformOwner, "Only platform owner can perform this action");
        _;
    }
    
    modifier onlyCampaignOwner(uint campaignId) {
        require(campaigns[campaignId].owner == msg.sender, "Only campaign owner can perform this action");
        _;
    }
    
    modifier campaignExists(uint campaignId) {
        require(campaignId < campaignCounter, "Campaign does not exist");
        _;
    }
    
    modifier notCompleted(uint campaignId) {
        require(!campaigns[campaignId].isCompleted, "Campaign is already completed");
        _;
    }

    constructor() {
        platformOwner = msg.sender;
    } 

    function createCampaign(string memory _title, string memory _description, uint _goal) external {
        require(_goal > 0, "Funding goal must be greater than zero");
        
        campaigns[campaignCounter] = Campaign(campaignCounter, _title, _description, msg.sender, _goal, 0, false);
        emit CampaignCreated(campaignCounter, _title, msg.sender, _goal);
        campaignCounter++;
    }

    function contribute(uint campaignId) external payable campaignExists(campaignId) notCompleted(campaignId) {
        require(msg.value > 0, "Contribution must be greater than zero");
        
        campaigns[campaignId].fundsRaised += msg.value;
        contributions[campaignId][msg.sender] += msg.value;
        emit Funded(campaignId, msg.sender, msg.value);
    }

    function completeCampaign(uint campaignId) external campaignExists(campaignId) onlyCampaignOwner(campaignId) notCompleted(campaignId) {
        require(campaigns[campaignId].fundsRaised >= campaigns[campaignId].goal, "Funding goal not reached");
        campaigns[campaignId].isCompleted = true;
        payable(msg.sender).transfer(campaigns[campaignId].fundsRaised);
        emit CampaignCompleted(campaignId, campaigns[campaignId].fundsRaised);
    }
}
