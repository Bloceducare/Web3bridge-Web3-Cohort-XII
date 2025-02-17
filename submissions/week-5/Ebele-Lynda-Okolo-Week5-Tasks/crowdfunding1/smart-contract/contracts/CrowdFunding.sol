// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Crowdfunding {
    struct Campaign {
        address creator;
        uint256 targetAmount;
        uint256 deadline;
        uint256 fundsRaised;
        string purpose;
        bool fundsWithdrawn;
        bool campaignClosed;
    }

    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => mapping(address => uint256)) public contributions;

    uint256 public campaignCount;
    IERC20 public immutable token;

    event CampaignCreated(uint256 indexed campaignId, address creator, uint256 targetAmount, uint256 deadline, string purpose);
    event Funded(uint256 indexed campaignId, address indexed backer, uint256 amount);
    event Withdrawn(uint256 indexed campaignId, address indexed creator, uint256 amount);
    event Refunded(uint256 indexed campaignId, address indexed backer, uint256 amount);
    event CampaignClosed(uint256 indexed campaignId);

    error OnlyCreator();
    error CampaignNotActive();
    error TargetNotReached();
    error AlreadyWithdrawn();
    error NoFundsToWithdraw();
    error NoFundsToRefund();
    error CampaignAlreadyClosed();
    error DeadlinePassed();

    constructor(address _token) {
        token = IERC20(_token);
    }

    function createCampaign(uint256 _targetAmount, uint256 _duration, string calldata _purpose) external {
        if (_duration == 0) revert DeadlinePassed();

        uint256 deadline = block.timestamp + _duration;
        campaigns[campaignCount] = Campaign({
            creator: msg.sender,
            targetAmount: _targetAmount,
            deadline: deadline,
            fundsRaised: 0,
            purpose: _purpose,
            fundsWithdrawn: false,
            campaignClosed: false
        });

        emit CampaignCreated(campaignCount, msg.sender, _targetAmount, deadline, _purpose);
        campaignCount++;
    }

    function fundCampaign(uint256 _campaignId, uint256 _amount) external {
        Campaign storage campaign = campaigns[_campaignId];

        if (campaign.campaignClosed) revert CampaignAlreadyClosed();
        if (block.timestamp > campaign.deadline) revert CampaignNotActive();

        token.transferFrom(msg.sender, address(this), _amount);

        campaign.fundsRaised += _amount;
        contributions[_campaignId][msg.sender] += _amount;

        emit Funded(_campaignId, msg.sender, _amount);

        if (campaign.fundsRaised >= campaign.targetAmount) {
            campaign.campaignClosed = true;
            emit CampaignClosed(_campaignId);
        }
    }

    function withdrawFunds(uint256 _campaignId) external {
        Campaign storage campaign = campaigns[_campaignId];

        if (msg.sender != campaign.creator) revert OnlyCreator();
        if (campaign.fundsRaised < campaign.targetAmount) revert TargetNotReached();
        if (campaign.fundsWithdrawn) revert AlreadyWithdrawn();

        campaign.fundsWithdrawn = true;
        token.transfer(msg.sender, campaign.fundsRaised);

        emit Withdrawn(_campaignId, msg.sender, campaign.fundsRaised);
    }

    function claimRefund(uint256 _campaignId) external {
        Campaign storage campaign = campaigns[_campaignId];

        if (block.timestamp < campaign.deadline) revert CampaignNotActive();
        if (campaign.fundsRaised >= campaign.targetAmount) revert NoFundsToRefund();
        if (campaign.campaignClosed) revert CampaignAlreadyClosed();

        uint256 contributedAmount = contributions[_campaignId][msg.sender];
        if (contributedAmount == 0) revert NoFundsToRefund();

        contributions[_campaignId][msg.sender] = 0;
        token.transfer(msg.sender, contributedAmount);

        emit Refunded(_campaignId, msg.sender, contributedAmount);
    }

    function closeCampaign(uint256 _campaignId) external {
        Campaign storage campaign = campaigns[_campaignId];

        if (msg.sender != campaign.creator) revert OnlyCreator();
        if (campaign.campaignClosed) revert CampaignAlreadyClosed();

        campaign.campaignClosed = true;
        emit CampaignClosed(_campaignId);
    }
}