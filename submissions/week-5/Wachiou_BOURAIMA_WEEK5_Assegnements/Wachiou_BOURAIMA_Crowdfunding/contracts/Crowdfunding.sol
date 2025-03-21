// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "./ERC20Token.sol";

error CrowdfundingClosed(uint256 deadline);
error CrowdfundingStillOpen(uint256 deadline);
error GoalNotReached(uint256 raisedAmount, uint256 goal);
error NotContributed();
error InvalidOwner();
error InvalidAddress();
error InvalidDeadline(string message);
error CompaignDoesNotExist();
error InvalidAmount(uint256 contributedAmount, uint256 amount);

// error CompaignAlreadyExists(uint256 campaignId);

contract Crowdfunding {
    address public manager;
    ERC20Token public token;

    mapping(address => uint256) public contributions;
    mapping(address => bool) public hasContributed;
    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => bool) public isClosed;
    mapping(uint256 => bool) public isGoalReached;
    uint256 public campaignCount;

    event CampaignCreated(
        string name,
        uint256 campaignId,
        string description,
        uint256 goal,
        uint256 deadline
    );
    event Contributed(
        address contributor,
        uint256 campaignId,
        uint256 amount,
        uint256 contributedAt
    );
    event withdrawn(address _from, address _to, uint256 _amount);
    event reverted(
        address _from,
        uint256 campaignId,
        uint256 amount,
        uint256 revertedAt
    );

    struct Campaign {
        string name;
        uint256 campaignId;
        string description;
        uint256 goal;
        uint256 deadline;
        uint256 raisedAmount;
        address _organizer;
    }

    constructor(
        address tokenAddress // string memory _tokenname,
    ) // string memory _tokensymbol,
    // uint256 _initialSupply
    {
        manager = msg.sender;
        // token = new ERC20Token(_tokenname, _tokensymbol, _initialSupply);
        token = ERC20Token(tokenAddress);
    }

    function createCampaign(
        string memory _name,
        string memory _description,
        uint256 _goal,
        uint256 _deadline
    ) public  {
        if (msg.sender == address(0)) {
            revert InvalidOwner();
        }

        if (_deadline < block.timestamp) {
            revert InvalidDeadline("Deadline must be in the future");
        }

        uint256 campaignId = campaignCount + 1;

        campaigns[campaignId] = Campaign({
            name: _name,
            campaignId: campaignId,
            description: _description,
            goal: _goal,
            deadline: _deadline,
            raisedAmount: 0,
            _organizer: msg.sender
        });

        campaignCount = campaignId;

        emit CampaignCreated(_name, campaignId, _description, _goal, _deadline);
    }

    function contribute(uint256 _campaignId, uint256 _amount) public {
        if (_campaignId == 0 || _campaignId > campaignCount) {
            revert CompaignDoesNotExist();
        }

        Campaign storage _campaign = campaigns[_campaignId];

        if (_campaign.deadline < block.timestamp) {
            revert CrowdfundingClosed(_campaign.deadline);
        } else {
            // if (_campaign.raisedAmount >= _campaign.goal) {
            //     revert GoalNotReached(_campaign.raisedAmount, _campaign.goal);
            // }
            token.transferFrom(msg.sender, address(this), _amount);
            _campaign.raisedAmount += _amount;
            contributions[msg.sender] += _amount;
            hasContributed[msg.sender] = true;
            emit Contributed(msg.sender, _campaignId, _amount, block.timestamp);
        }
    }

    function reverseContribution(uint256 _campaignId, uint256 _amount) public {
        if (_campaignId == 0 || _campaignId > campaignCount) {
            revert CompaignDoesNotExist();
        }

        Campaign storage _campaign = campaigns[_campaignId];

        if (_campaign.deadline < block.timestamp) {
            revert CrowdfundingClosed(_campaign.deadline);
        }

        if (hasContributed[msg.sender] == false) {
            revert NotContributed();
        } else {
            if (_amount > contributions[msg.sender]) {
                revert InvalidAmount(contributions[msg.sender], _amount);
            }

            token.transfer(msg.sender, _amount);

            _campaign.raisedAmount -= _amount;
            contributions[msg.sender] -= _amount;
            hasContributed[msg.sender] = false;
            emit reverted(msg.sender, _campaignId, _amount, block.timestamp);
        }
    }

    function checkGoalReached(uint256 campagnId) public {
        Campaign storage _campaign = campaigns[campagnId];
        if (_campaign.raisedAmount >= _campaign.goal) {
            isGoalReached[campagnId] = true;
        } else {
            isGoalReached[campagnId] = false;
        }
    }

    function withdraw(uint256 _campagnId) public {
        Campaign storage _campaign = campaigns[_campagnId];
        if (_campaign._organizer != msg.sender) {
            revert InvalidOwner();
        }
        if (_campaign.deadline > block.timestamp) {
            revert CrowdfundingStillOpen(_campaign.deadline);
        }
        // if (_campaign.raisedAmount < _campaign.goal) {
        //     revert GoalNotReached(_campaign.raisedAmount, _campaign.goal);
        // }
        token.transfer(_campaign._organizer, _campaign.raisedAmount);
        emit withdrawn(
            address(this),
            _campaign._organizer,
            _campaign.raisedAmount
        );
    }

    function getBalance() public view returns (uint256) {
        return token.balanceOf(address(this));
    }

    function getraisedAmount(
        uint256 _campaignId
    ) public view returns (uint256) {
        Campaign storage _campaign = campaigns[_campaignId];
        if (_campaignId == 0 || _campaignId > campaignCount) {
            revert CompaignDoesNotExist();
        }

        return _campaign.raisedAmount;
    }
}
