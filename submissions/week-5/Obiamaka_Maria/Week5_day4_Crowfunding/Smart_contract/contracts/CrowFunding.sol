// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import "./OURERC20.sol"; 

contract CrowdFunding {

    OurERC20 public token;  // ERC20 Token used for donations

    // Events
    event ProjectCreated(uint256 indexed projectId, address indexed organizer);
    event UserDonated(uint256 indexed projectId, address indexed donor, uint256 amount);
    event FundsWithdrawn(uint256 indexed projectId, address indexed organizer, uint256 amount);
    event RefundClaimed(uint256 indexed projectId, address indexed donor, uint256 amount);

    struct ProjectDetails {
        string title;
        string description;
        uint256 startDate;
        uint256 endDate;
        uint256 projectFee;
        address organizer;
        uint256 totalRaised;
        bool fundsWithdrawn;
    }

    // State variables
    uint256 public projectIdCounter;
    mapping(uint256 => ProjectDetails) public projects;
    mapping(uint256 => mapping(address => uint256)) public donations; // projectId => (donor => amount)

    constructor(address _tokenAddress) {
        token = OurERC20(_tokenAddress);
    }

    // Create a new crowdfunding project
    function createProject(
        string memory _title,
        string memory _desc,
        uint256 _startDate,
        uint256 _endDate,
        uint256 _projectFee
    ) external {
        require(_startDate > block.timestamp, "Start date must be in the future");
        require(_startDate < _endDate, "End date must be after start date");

        projectIdCounter++;
        projects[projectIdCounter] = ProjectDetails({
            title: _title,
            description: _desc,
            startDate: _startDate,
            endDate: _endDate,
            projectFee: _projectFee,
            organizer: msg.sender,
            totalRaised: 0,
            fundsWithdrawn: false
        });

        emit ProjectCreated(projectIdCounter, msg.sender);
    }

    // Donate ERC20 tokens to a project
    function donateProject(uint256 _projectId, uint256 _amount) external {
        ProjectDetails storage project = projects[_projectId];
        require(block.timestamp >= project.startDate, "Project has not started yet");
        require(block.timestamp <= project.endDate, "Project has ended");
        require(_amount > 0, "Donation must be greater than zero");

        // Transfer tokens from the donor to this contract
        require(token.transferFrom(msg.sender, address(this), _amount), "Token transfer failed");

        // Track the donation
        project.totalRaised += _amount;
        donations[_projectId][msg.sender] += _amount;

        emit UserDonated(_projectId, msg.sender, _amount);
    }

    // Withdraw funds if the goal is met
    function withdrawFunds(uint256 _projectId) external {
        ProjectDetails storage project = projects[_projectId];
        require(msg.sender == project.organizer, "Only organizer can withdraw");
        require(block.timestamp > project.endDate, "Project has not ended yet");
        require(project.totalRaised >= project.projectFee, "Funding goal not met");
        require(!project.fundsWithdrawn, "Funds already withdrawn");

        project.fundsWithdrawn = true;

        // Transfer the funds to the organizer
        require(token.transfer(msg.sender, project.totalRaised), "Transfer to organizer failed");

        emit FundsWithdrawn(_projectId, msg.sender, project.totalRaised);
    }

    // Refund donations if goal is not met
    function claimRefund(uint256 _projectId) external {
        ProjectDetails storage project = projects[_projectId];
        require(block.timestamp > project.endDate, "Project has not ended yet");
        require(project.totalRaised < project.projectFee, "Funding goal was met");
        
        uint256 donationAmount = donations[_projectId][msg.sender];
        require(donationAmount > 0, "No donations found");

        // Reset the donation amount
        donations[_projectId][msg.sender] = 0;

        // Refund the donor
        require(token.transfer(msg.sender, donationAmount), "Refund transfer failed");

        emit RefundClaimed(_projectId, msg.sender, donationAmount);
    }
}
