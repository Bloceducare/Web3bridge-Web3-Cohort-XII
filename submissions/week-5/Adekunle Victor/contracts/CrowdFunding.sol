// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CrowdFunding {
    address public owner;
    IERC20 public token;
    uint256 public campaignCounter;

    struct Campaign {
        string name;
        string description;
        uint256 goal;
        uint256 deadline;
        uint256 amountRaised;
        address payable creator;
        bool withdrawn;
    }

    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => mapping(address => uint256)) public campaignContributions;

    error InvalidAddress();
    error CampaignEnded();
    error CampaignStillActive();
    error GoalReached();
    error NotTheOwner();
    error GoalNotReached();
    error FundAlreadyWithdrawn();
    error TransferFailed();
    error InvalidContribution();
    error NoContribution();

    event CampaignCreated(uint256 id, string name, uint256 goal, uint256 deadline, address creator);
    event ContributionMade(uint256 id, address contributor, uint256 amount);
    event FundsWithdrawn(uint256 id, uint256 amount);
    event RefundIssued(uint256 id, address contributor, uint256 amount);

    constructor(address _tokenAddress) {
        if (_tokenAddress == address(0)) revert InvalidAddress();
        owner = msg.sender;
        token = IERC20(_tokenAddress);
    }

    modifier onlyOwner(uint256 _id) {
        if (msg.sender != campaigns[_id].creator) revert NotTheOwner();
        _;
    }

    modifier campaignActive(uint256 _id) {
        if (block.timestamp > campaigns[_id].deadline) revert CampaignEnded();
        _;
    }

    modifier campaignEnded(uint256 _id) {
        if (block.timestamp <= campaigns[_id].deadline) revert CampaignStillActive();
        _;
    }

    function createCampaign(
        string memory _name,
        string memory _description,
        uint256 _goal,
        uint256 _duration
    ) external {
        if (_goal == 0) revert InvalidContribution(); // Prevent zero-goal campaigns

        uint256 id = campaignCounter++;
        campaigns[id] = Campaign({
            name: _name,
            description: _description,
            goal: _goal,
            deadline: block.timestamp + _duration,
            amountRaised: 0,
            creator: payable(msg.sender),
            withdrawn: false
        });

        emit CampaignCreated(id, _name, _goal, block.timestamp + _duration, msg.sender);
    }

    function contribute(uint256 _id, uint256 _amount) external campaignActive(_id) {
        Campaign storage campaign = campaigns[_id];

        if (_amount == 0) revert InvalidContribution();
        if (campaign.amountRaised + _amount > campaign.goal) revert GoalReached();

        bool success = token.transferFrom(msg.sender, address(this), _amount);
        if (!success) revert TransferFailed();

        campaign.amountRaised += _amount;
        campaignContributions[_id][msg.sender] += _amount;

        emit ContributionMade(_id, msg.sender, _amount);
    }

    function withdraw(uint256 _id) external onlyOwner(_id) campaignEnded(_id) {
        Campaign storage campaign = campaigns[_id];

        if (campaign.amountRaised < campaign.goal) revert GoalNotReached();
        if (campaign.withdrawn) revert FundAlreadyWithdrawn();

        campaign.withdrawn = true;
        bool success = token.transfer(campaign.creator, campaign.amountRaised);
        if (!success) revert TransferFailed();

        emit FundsWithdrawn(_id, campaign.amountRaised);
    }

    function refundBackers(uint256 _id) external campaignEnded(_id) {
        Campaign storage campaign = campaigns[_id];

        if (campaign.amountRaised >= campaign.goal) revert GoalReached();

        uint256 contribution = campaignContributions[_id][msg.sender];
        if (contribution == 0) revert NoContribution();

        campaignContributions[_id][msg.sender] = 0;

        bool success = token.transfer(msg.sender, contribution);
        if (!success) revert TransferFailed();

        emit RefundIssued(_id, msg.sender, contribution);
    }
}
